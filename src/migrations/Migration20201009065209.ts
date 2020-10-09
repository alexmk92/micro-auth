import { Migration } from '@mikro-orm/migrations';

export class Migration20201009065209 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" uuid not null default gen_random_uuid(), "email" text not null, "username" text not null, "password" varchar(255) not null, "bio" text null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("id");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');

    this.addSql('create table "project" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null, "description" text not null);');
    this.addSql('alter table "project" add constraint "project_pkey" primary key ("id");');
  }

}
