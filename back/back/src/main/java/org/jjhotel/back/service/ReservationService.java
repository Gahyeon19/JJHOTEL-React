package org.jjhotel.back.service;

import lombok.RequiredArgsConstructor;
import org.jjhotel.back.domain.dto.ReservationInfoDto;
import org.jjhotel.back.domain.dto.ReservationWithGuestInfoDto;
import org.jjhotel.back.domain.dto.RoomReservationDto;
import org.jjhotel.back.domain.entity.Guest;
import org.jjhotel.back.domain.entity.Reservation;
import org.jjhotel.back.domain.entity.Room;
import org.jjhotel.back.repository.GuestRepository;
import org.jjhotel.back.repository.ReservationRepository;
import org.jjhotel.back.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final RoomRepository roomRepository;

    public ReservationInfoDto getReservationInfo(ReservationWithGuestInfoDto reservationWithGuestInfoDto) {
        Reservation reservation = reservationRepository.findByReservationId(reservationWithGuestInfoDto.getReservationId()).get();
        ReservationInfoDto reservationInfoDto = ReservationInfoDto.of(reservation);
        return reservationInfoDto;
    }

    public String doReservation(RoomReservationDto info, String guestId) {
        Room room = roomRepository.findByRoomId(info.getRoomId()).get();
        Guest guest = guestRepository.findById(guestId).get();

        LocalDate reservationDate = parseToLocalDate(info.getReservationDate());
        String formattedDate = reservationDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

        int reservationCount = reservationRepository.findByReservationDate(reservationDate).size();
        String reservationId = String.format("%s-%d", formattedDate, reservationCount);

        Reservation reservation = Reservation.createReservation(info, room, guest);
        reservation.setReservationId(reservationId);
        reservation.setCheckInDate(parseToLocalDate(info.getCheckInDate()));
        reservation.setCheckOutDate(parseToLocalDate(info.getCheckOutDate()));
        reservation.setReservationDate(reservationDate);

        Reservation save = reservationRepository.save(reservation);
        return save.getReservationId();
    }

    private LocalDate parseToLocalDate(String date) {
        return OffsetDateTime.parse(date, DateTimeFormatter.ISO_OFFSET_DATE_TIME).toLocalDate();
    }
}
