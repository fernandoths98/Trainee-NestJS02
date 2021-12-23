import { Event } from 'src/entities/event.entity';
import { Profile } from './profile.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expose } from 'class-transformer';
import { Attendee } from 'src/entities/attendee.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @Expose()
    id: number;

    @Column({ unique: true})
    @Expose()
    username: string;

    @Column()
    password: string;

    @Column({ unique: true})
    @Expose()
    email: string;

    @Column()
    @Expose()
    firstname: string;

    @Column()
    @Expose()
    lastname: string;

    @OneToOne(() => Profile)
    @JoinColumn()
    @Expose()
    profile: Profile;

    @OneToMany(() => Event, (event) => event.organizer)
    @Expose()
    organized: Event[];

    @OneToMany(() => Attendee, (attendee) => attendee.user)
    attendee: Attendee[];
}