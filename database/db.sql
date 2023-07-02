BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "activationusers" (
	"id"	TEXT,
	"username"	TEXT,
	"data"	TEXT,
	"status"	INTEGER,
	"created_at"	INTEGER,
	"modified_at"	INTEGER,
	"expired_at"	INTEGER,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "data_faqs" (
	"id"	TEXT,
	"question"	TEXT,
	"answer"	TEXT,
	"position"	INTEGER,
	"status"	INTEGER,
	"created_at"	INTEGER,
	"modified_at"	INTEGER,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "data_ssos" (
	"id"	TEXT,
	"username"	TEXT,
	"name"	TEXT,
	"key"	TEXT,
	"callback_url"	TEXT,
	"status"	INTEGER,
	"created_at"	INTEGER,
	"modified_at"	INTEGER
);
CREATE TABLE IF NOT EXISTS "forgotpasswords" (
	"id"	TEXT,
	"user_id"	TEXT,
	"status"	INTEGER,
	"created_at"	INTEGER,
	"modified_at"	INTEGER,
	"expired_at"	INTEGER,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "lastlogins" (
	"user_id"	TEXT,
	"username"	TEXT,
	"email"	TEXT,
	"gravatar"	TEXT,
	"login_at"	INTEGER,
	PRIMARY KEY("user_id")
);
CREATE TABLE IF NOT EXISTS "menus" (
	"id"	TEXT,
	"name"	TEXT,
	"url"	TEXT,
	"role"	TEXT,
	"position"	INTEGER,
	"icon"	TEXT,
	"child"	TEXT,
	"status"	INTEGER,
	"created_at"	INTEGER,
	"modified_at"	INTEGER,
	"group"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	TEXT,
	"username"	TEXT,
	"fullname"	TEXT,
	"email"	TEXT,
	"gravatar"	TEXT,
	"role"	TEXT,
	"data"	TEXT,
	"hash"	TEXT,
	"method"	TEXT,
	"service"	TEXT,
	"status"	INTEGER,
	"created_at"	INTEGER,
	"modified_at"	INTEGER,
	"created_at_month"	TEXT,
	"created_at_year"	INTEGER,
	PRIMARY KEY("id")
);
INSERT INTO "data_faqs" ("id","question","answer","position","status","created_at","modified_at") VALUES ('d33f4a9a-2c9b-4f2d-b646-3ec10bea81f5','Lorem ipsum dolor sit amet','Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sodales lacinia molestie. Proin suscipit, velit nec rutrum commodo, dui ipsum vehicula urna, non luctus sapien tellus non felis. Cras ante urna, condimentum et hendrerit non, placerat nec turpis. Aliquam erat volutpat. Cras interdum metus sed urna eleifend, sed iaculis nibh tempus. Etiam pretium, libero non pretium tincidunt, lectus dolor commodo est, vitae placerat enim est vel justo. Duis ut mauris a orci ultricies ullamcorper et id lectus. Fusce vestibulum metus arcu, quis volutpat eros convallis ut. Vivamus malesuada ultrices tortor, a elementum nisl eleifend sed. Donec ut dui non tortor consectetur molestie. Nulla vel diam tincidunt, eleifend nisi ut, scelerisque velit. Cras laoreet vestibulum nibh ac varius. Nulla dictum molestie risus vel auctor. Nullam convallis et metus ut malesuada. Sed ornare efficitur orci quis auctor. Etiam risus mi, bibendum in aliquet eget, convallis vitae neque.',1,1,1665237880961,1665237880961);
INSERT INTO "menus" ("id","name","url","role","position","icon","child","status","created_at","modified_at","group") VALUES ('aa4b119f-7109-4b07-bb62-6f6954e2f221','Dashboard','/dashboard','admin',1,'ni ni-tv-2 text-primary',NULL,1,1661163878712,1661164057686,'admin'),
 ('cce5effe-15f1-4bda-beb9-52a2192f2425','Data User','/data-user','admin',2,'ni ni-single-02 text-dark',NULL,1,1661163904047,1661164777229,'admin'),
 ('c682db4c-0a35-4e4d-9e25-ab21bec1f8be','Data Menu','/data-menu','admin',5,'ni ni-bullet-list-67 text-danger',NULL,1,1661163978478,1666188473583,'admin'),
 ('90823aef-2084-450e-b25a-e95a62dfc35f','My Profile','/my-profile','admin, member',1,'ni ni-single-02 text-success',NULL,1,1661165044065,1661165044065,'account'),
 ('0b78b80a-e0c0-45a7-9692-6778e0c05898','Data FAQ','/data-faq','admin',3,'fa fa-question text-success',NULL,1,1665227622249,1665227622249,'admin'),
 ('037dafd8-ea40-4609-8887-0c90230b10ba','Support','/support','admin, member',3,'fa fa-life-ring text-danger',NULL,1,1665238178315,1666186696086,'account'),
 ('c07dac54-a618-4d5a-bbc0-47f877d40099','My SSO','/my-sso','admin, member',2,'fa fa-key text-primary',NULL,1,1666186638350,1666207263165,'account'),
 ('88f2d5c1-a78a-436b-b746-ad6a36d60c8b','Data SSO','/data-sso','admin',4,'fa fa-key text-primary',NULL,1,1666188456360,1666188456360,'admin');
CREATE INDEX IF NOT EXISTS "index_activationusers" ON "activationusers" (
	"username"
);
CREATE INDEX IF NOT EXISTS "index_data_ssos" ON "data_ssos" (
	"username",
	"key"
);
CREATE INDEX IF NOT EXISTS "index_users" ON "users" (
	"username",
	"email"
);
COMMIT;
