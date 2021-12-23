import { IsEnum } from "class-validator";
import { AttendeeAnswerEnum } from "src/entities/attendee.entity";

export class CreateAttendeeDto {
    @IsEnum(AttendeeAnswerEnum)
    answer: AttendeeAnswerEnum;
  }