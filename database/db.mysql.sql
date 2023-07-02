SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for activationusers
-- ----------------------------
DROP TABLE IF EXISTS `activationusers`;
CREATE TABLE `activationusers` (
  `id` varchar(100) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `data` text,
  `status` int(11) DEFAULT NULL,
  `created_at` bigint(13) DEFAULT NULL,
  `modified_at` bigint(13) DEFAULT NULL,
  `expired_at` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_activationusers` (`username`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for data_faqs
-- ----------------------------
DROP TABLE IF EXISTS `data_faqs`;
CREATE TABLE `data_faqs` (
  `id` varchar(100) NOT NULL,
  `question` text,
  `answer` text,
  `position` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `created_at` bigint(13) DEFAULT NULL,
  `modified_at` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of data_faqs
-- ----------------------------
BEGIN;
INSERT INTO `data_faqs` (`id`, `question`, `answer`, `position`, `status`, `created_at`, `modified_at`) VALUES ('d33f4a9a-2c9b-4f2d-b646-3ec10bea81f5', 'Lorem ipsum dolor sit amet', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sodales lacinia molestie. Proin suscipit, velit nec rutrum commodo, dui ipsum vehicula urna, non luctus sapien tellus non felis. Cras ante urna, condimentum et hendrerit non, placerat nec turpis. Aliquam erat volutpat. Cras interdum metus sed urna eleifend, sed iaculis nibh tempus. Etiam pretium, libero non pretium tincidunt, lectus dolor commodo est, vitae placerat enim est vel justo. Duis ut mauris a orci ultricies ullamcorper et id lectus. Fusce vestibulum metus arcu, quis volutpat eros convallis ut. Vivamus malesuada ultrices tortor, a elementum nisl eleifend sed. Donec ut dui non tortor consectetur molestie. Nulla vel diam tincidunt, eleifend nisi ut, scelerisque velit. Cras laoreet vestibulum nibh ac varius. Nulla dictum molestie risus vel auctor. Nullam convallis et metus ut malesuada. Sed ornare efficitur orci quis auctor. Etiam risus mi, bibendum in aliquet eget, convallis vitae neque.', 1, 1, -1209429887, -1209429887);
COMMIT;

-- ----------------------------
-- Table structure for data_ssos
-- ----------------------------
DROP TABLE IF EXISTS `data_ssos`;
CREATE TABLE `data_ssos` (
  `id` varchar(100) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `key` varchar(100) DEFAULT NULL,
  `callback_url` text,
  `status` int(11) DEFAULT NULL,
  `created_at` bigint(13) DEFAULT NULL,
  `modified_at` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_data_ssos` (`username`,`key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for forgotpasswords
-- ----------------------------
DROP TABLE IF EXISTS `forgotpasswords`;
CREATE TABLE `forgotpasswords` (
  `id` varchar(100) NOT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `created_at` bigint(13) DEFAULT NULL,
  `modified_at` bigint(13) DEFAULT NULL,
  `expired_at` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for lastlogins
-- ----------------------------
DROP TABLE IF EXISTS `lastlogins`;
CREATE TABLE `lastlogins` (
  `user_id` varchar(100) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gravatar` text,
  `login_at` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for menus
-- ----------------------------
DROP TABLE IF EXISTS `menus`;
CREATE TABLE `menus` (
  `id` varchar(100) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `url` text,
  `role` varchar(100) DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `child` text,
  `status` int(11) DEFAULT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  `modified_at` bigint(20) DEFAULT NULL,
  `group` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of menus
-- ----------------------------
BEGIN;
INSERT INTO `menus` (`id`, `name`, `url`, `role`, `position`, `icon`, `child`, `status`, `created_at`, `modified_at`, `group`) VALUES ('037dafd8-ea40-4609-8887-0c90230b10ba', 'Support', '/support', 'admin, member', 3, 'fa fa-life-ring text-danger', NULL, 1, 1665238178315, 1666186696086, 'account');
INSERT INTO `menus` (`id`, `name`, `url`, `role`, `position`, `icon`, `child`, `status`, `created_at`, `modified_at`, `group`) VALUES ('0b78b80a-e0c0-45a7-9692-6778e0c05898', 'Data FAQ', '/data-faq', 'admin', 3, 'fa fa-question text-success', NULL, 1, 1665227622249, 1665227622249, 'admin');
INSERT INTO `menus` (`id`, `name`, `url`, `role`, `position`, `icon`, `child`, `status`, `created_at`, `modified_at`, `group`) VALUES ('88f2d5c1-a78a-436b-b746-ad6a36d60c8b', 'Data SSO', '/data-sso', 'admin', 4, 'fa fa-key text-primary', NULL, 1, 1666188456360, 1666188456360, 'admin');
INSERT INTO `menus` (`id`, `name`, `url`, `role`, `position`, `icon`, `child`, `status`, `created_at`, `modified_at`, `group`) VALUES ('90823aef-2084-450e-b25a-e95a62dfc35f', 'My Profile', '/my-profile', 'admin, member', 1, 'ni ni-single-02 text-success', NULL, 1, 1661165044065, 1661165044065, 'account');
INSERT INTO `menus` (`id`, `name`, `url`, `role`, `position`, `icon`, `child`, `status`, `created_at`, `modified_at`, `group`) VALUES ('aa4b119f-7109-4b07-bb62-6f6954e2f221', 'Dashboard', '/dashboard', 'admin', 1, 'ni ni-tv-2 text-primary', NULL, 1, 1661163878712, 1661164057686, 'admin');
INSERT INTO `menus` (`id`, `name`, `url`, `role`, `position`, `icon`, `child`, `status`, `created_at`, `modified_at`, `group`) VALUES ('c07dac54-a618-4d5a-bbc0-47f877d40099', 'My SSO', '/my-sso', 'admin, member', 2, 'fa fa-key text-primary', NULL, 1, 1666186638350, 1666207263165, 'account');
INSERT INTO `menus` (`id`, `name`, `url`, `role`, `position`, `icon`, `child`, `status`, `created_at`, `modified_at`, `group`) VALUES ('c682db4c-0a35-4e4d-9e25-ab21bec1f8be', 'Data Menu', '/data-menu', 'admin', 5, 'ni ni-bullet-list-67 text-danger', NULL, 1, 1661163978478, 1666188473583, 'admin');
INSERT INTO `menus` (`id`, `name`, `url`, `role`, `position`, `icon`, `child`, `status`, `created_at`, `modified_at`, `group`) VALUES ('cce5effe-15f1-4bda-beb9-52a2192f2425', 'Data User', '/data-user', 'admin', 2, 'ni ni-single-02 text-dark', NULL, 1, 1661163904047, 1661164777229, 'admin');
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(100) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `fullname` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `gravatar` text,
  `role` varchar(100) DEFAULT NULL,
  `data` text,
  `hash` text,
  `method` varchar(100) DEFAULT NULL,
  `service` varchar(100) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `created_at` bigint(13) DEFAULT NULL,
  `modified_at` bigint(13) DEFAULT NULL,
  `created_at_month` varchar(100) DEFAULT NULL,
  `created_at_year` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index_users` (`username`,`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
