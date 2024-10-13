import { useLocation } from "react-router-dom"
import { titles } from "../text/titles"
import TitleLabel from "./TitleLabel"
import RoomInfo from "./RoomInfo"
import CustomInfo from "./CustomInfo"

export default function ReservationInputCustomInfo() {
  const location = useLocation()
  const roomId = location.state.roomId
  const reservationInfo = location.state.reservationInfo

  const saveRservation = (customerInfo) => {
    console.log("Room ID:", roomId);
    console.log("Reservation Info:", reservationInfo);
    console.log("Customer Info:", customerInfo);
  }

  return (
    <>
      <TitleLabel title={titles.inputCustomInfo.title} subTitle={titles.inputCustomInfo.subTitle} />
      <RoomInfo roomId={roomId} reservationInfo={reservationInfo} /><br />
      <CustomInfo isReservation={true} onSave={saveRservation}/>
    </>
  )
}