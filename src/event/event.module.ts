import { Teacher } from './../school/teacher.entity';
import { Subject } from './../school/subject.entity';
import { Attendee } from './../entities/attendee.entity';
import { EventController } from './event.controller';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from 'src/entities/event.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Event, Attendee, Subject, Teacher])
    ],
    controllers: [EventController],
    providers: [],
    exports: []
})

export class EventModule {

}