CREATE TABLE `fbs_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) COLLATE utf8mb4_bin NOT NULL,
  `gender` tinyint NOT NULL,
  `first_phone_number` smallint NOT NULL,
  `second_phone_number` smallint NOT NULL,
  `third_phone_number` smallint NOT NULL,
  `create_at` bigint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
