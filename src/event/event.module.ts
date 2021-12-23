import { AttendeeService } from './attendee.service';
import { EventAttendeeController } from './event-attendee.controller';
import { Profile } from './../auth/profile.entity';
import { EventService } from './event.service';
import { Teacher } from './../school/teacher.entity';
import { Subject } from './../school/subject.entity';
import { Attendee } from './../entities/attendee.entity';
import { EventController } from './event.controller';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';
import { User } from 'src/auth/user.entity';
import { EventsOrganizedByUserController } from './events-organized-by-user.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Event, Attendee, Subject, Teacher, User, Profile])
    ],
    controllers: [
        EventController, 
        EventAttendeeController,
        EventAttendeeController,
        EventsOrganizedByUserController],
    providers: [EventService, AttendeeService],
    exports: []
})

export class EventModule {

}