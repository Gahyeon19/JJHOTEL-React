import express from 'express'
import cors from 'cors'
import mysql from 'mysql2'
import nodemailer from 'nodemailer'
import path from 'path'
import { fileURLToPath } from 'url';

const app = express()
app.use(cors())
app.use(express.json())

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '1111',
  database: 'jjhotel'
});

connection.connect((err) => {
if (err) {
  console.error('MySQL 연결 실패:', err);
} else {
  console.log('MySQL 연결 성공');
}
});

// __dirname 설정 (ES 모듈용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 정적 파일 서빙 설정 (dist 폴더)
app.use(express.static(path.join(__dirname, 'dist')));

// 모든 경로에 대해 index.html 서빙 (React 라우팅)
app.get('*', (req, res) => {
res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 서버 실행
const port = 3003;
app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});

// 예약하기
app.post('/reservation', (req, res) => {
    let { roomId, reservationInfo, customerInfo, totalPrice } = req.body
    let { customCount, roomCount, checkInDate, checkOutDate, reservationDate } = reservationInfo
    let { name, email } = customerInfo

    const formattedReservationDate = new Date(reservationDate).toISOString().slice(0, 10)

    const checkInDateLocal = new Date(checkInDate);
    checkInDateLocal.setDate(checkInDateLocal.getDate() + 1);  
    const formattedCheckInDate = checkInDateLocal.toISOString().slice(0, 10);
    
    const checkOutDateLocal = new Date(checkOutDate);
    checkOutDateLocal.setDate(checkOutDateLocal.getDate() + 1);  
    const formattedCheckOutDate = checkOutDateLocal.toISOString().slice(0, 10);

    let selectSql = 'select * from reservation where reservationDate = ?'

    connection.query(selectSql, [formattedReservationDate], (error, results) => {
        if (error) {
            console.log(error)
        } else {
            const count = results.length + 1
            const id = `${formattedReservationDate}-${count}`

            let sql = 'INSERT INTO reservation() VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            connection.query(sql,
                [id, roomId, formattedCheckInDate, formattedCheckOutDate, customCount, formattedReservationDate, name, email, totalPrice, roomCount],
                (error, results) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log("results")
                        sendEamil(id, customerInfo, formattedCheckInDate, formattedCheckOutDate)
                        return res.status(200).send({id});
                    }
                })
        }
    })
})

const sendEamil = (id, customerInfo, checkInDate, checkOutDate) => {   
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'conn0204@gmail.com',
        pass: 'tuwd tbdr aucd ohdb'
      }
    }) 
    
    const mailOptions = {
      from: 'conn0204@gmail.com',
      to: `${customerInfo.email}`,
      subject: '예약 확인 메일입니다.',
      html: `
      <p>${customerInfo.name} 님 안녕하세요. JJ 호텔입니다.</p>
      <br>
      <p>이용 날짜: <strong>${checkInDate} ~ ${checkOutDate}</strong></p>
      <p>예약 번호: <strong>${id}</strong></p>
      <br>
      <p>저희 호텔을 이용해주셔서 감사합니다. 예약이 완료되었습니다.</p>
    `
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log("success")
      }
    })
  }

// 전체 객실 불러오기
app.get('/rooms', function (req, res) {
    let sql = 'select * from room'
    connection.query(sql, function (error, results) {
        if (error) {
            console.log(error)
        } else {
            res.send(results)
        }
    })
})

// 조건에 맞는 객실 불러오기
app.post('/filteredRooms', function (req, res) {
  let { reservationInfo } = req.body
  let { customCount, roomCount, checkInDate, checkOutDate } = reservationInfo

  const checkInDateLocal = new Date(checkInDate);
  checkInDateLocal.setDate(checkInDateLocal.getDate() + 1);  
  const formattedCheckInDate = checkInDateLocal.toISOString().slice(0, 10);
  
  const checkOutDateLocal = new Date(checkOutDate);
  checkOutDateLocal.setDate(checkOutDateLocal.getDate() + 1);  
  const formattedCheckOutDate = checkOutDateLocal.toISOString().slice(0, 10);

  let sql = `
SELECT r.roomId, r.roomName, r.maxNumberOfPeople, r.price, r.imageURL1, 
       (r.roomCount - COALESCE(SUM(CASE 
                                      WHEN (res.checkInDate < ? AND res.checkOutDate > ?) 
                                      THEN res.roomCount 
                                      ELSE 0 
                                    END), 0)) AS avaRooms
FROM room r
LEFT JOIN reservation res ON r.roomId = res.roomId
WHERE r.maxNumberOfPeople >= ?
GROUP BY r.roomId, r.roomName, r.maxNumberOfPeople, r.price, r.roomCount
HAVING avaRooms >= ?;
`

connection.query(sql,
  [formattedCheckOutDate, formattedCheckInDate, customCount, roomCount],
  (error, results) => {
    if (error) {
      console.log(error)
    } else {
      res.send(results)
    }
  })
})

// 객실 상세 내용 불러오기
app.post('/roomDescription', (req, res) => {
  let roomId = req.body.roomId
  let sql = 'select * from room where roomId = ?'
  connection.query(sql, [roomId], function (error, results) {
    if (error) {
      console.log(error)
    } else {
      res.send(results)
    }
  })
})

// 입력받은 고객 정보와 일치하는 정보 가져오기
app.get('/checkreservation', function (req, res) {
  const { name, reservationId } = req.query
  let sql = `
SELECT checkInDate, checkOutDate, (checkOutDate - checkInDate) as n, name, id, roomName, numberOfPeople
from reservation r join room on r.roomId = room.roomId 
where r.id = ? and r.name = ? 
`

  connection.query(sql, [reservationId, name], function (error, results) {
    if (error) {
      console.log(error)
    } else {
      res.send(results)
    }
  })
})

// 예약 내역 삭제하기 (name = '취소♪')
app.post('/checkreservation/delete', function (req, res) {
  const { name, id } = req.body

  let sql = `
update reservation 
set name = '취소♪' 
where id = ? and name = ?
`

  connection.query(sql, [id, name], function (error, results) {
    if (error) {
      console.log(error)
    } else {
      res.send(results)
    }
  })
})