import { Event } from 'src/entities/event.entity';
import { ClassSerializerInterceptor, Controller, Get, Param, ParseIntPipe, SerializeOptions, UseInterceptors } from "@nestjs/common";
import { AttendeeService } from './attendee.service';

@Controller('events/:eventId/attendees')
@SerializeOptions({strategy: 'excludeAll'})
export class EventAttendeeController {
    constructor(
        private readonly attendeeService: AttendeeService
    ){
    }

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    async findAll(@Param('eventId', ParseIntPipe) eventId: number) {
        return await this.attendeeService.findByEventId(eventId);
    }
}