import CustomButton from "./CustomButton"
import { useState } from "react";

export default function CustomInfo({ onSave }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const saveRservation = () => {
    const customerInfo = { name, email }

    if (!customerInfo.name || !customerInfo.email) {
      alert("성함 또는 이메일을 입력해 주세요")
    } else {
      onSave(customerInfo)
    }
  }

  return (
    <>
      <div className="customInfoContainer">
        <p>고객 정보</p>
        <pre>*입력하신 이메일로 예약번호가 전송됩니다</pre>
        <div className="customInfoSection">
          
          <div className="infoSectionLeft">
            <div className="infoRow">
              <label className="customInfoLabel">성명</label>
              <input className="customInfoValue" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="infoRow">
              <label className="customInfoLabel">이메일</label>
              <input className="customInfoValue" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="infoSectionRight">
            <CustomButton title="입력완료" onClicked={saveRservation} />
          </div>
        </div>


      </div>
    </>
  )
}