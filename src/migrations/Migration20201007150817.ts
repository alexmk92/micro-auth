import { Migration } from '@mikro-orm/migrations';

export class Migration20201007150817 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "project" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" text not null, "description" text not null);');
    this.addSql('alter table "project" add constraint "project_pkey" primary key ("id");');
  }

  async down(): Promise<void> {
    this.addSql('delete table "project"')
  }
}
