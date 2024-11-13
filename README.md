# Sequelize schema tool

Quickly explore what Sequelize is doing in a Docker container.

```shell
# get started
$ npm install
$ cp .env.example .env
$ npm run db:up

# iterate
$ vi src/index.ts
$ npm run dev

# end
$ npm run db:down
```

Example

```shell
$ npm run dev
Executing (default): DROP TABLE IF EXISTS `Things`;
Executing (default): SELECT CONSTRAINT_NAME as constraint_name,CONSTRAINT_NAME as constraintName,CONSTRAINT_SCHEMA as constraintSchema,CONSTRAINT_SCHEMA as constraintCatalog,TABLE_NAME as tableName,TABLE_SCHEMA as tableSchema,TABLE_SCHEMA as tableCatalog,COLUMN_NAME as columnName,REFERENCED_TABLE_SCHEMA as referencedTableSchema,REFERENCED_TABLE_SCHEMA as referencedTableCatalog,REFERENCED_TABLE_NAME as referencedTableName,REFERENCED_COLUMN_NAME as referencedColumnName FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE where TABLE_NAME = 'Things' AND CONSTRAINT_NAME!='PRIMARY' AND CONSTRAINT_SCHEMA='local_dev' AND REFERENCED_TABLE_NAME IS NOT NULL;
Executing (default): DROP TABLE IF EXISTS `Things`;
Executing (default): DROP TABLE IF EXISTS `Things`;
Executing (default): CREATE TABLE IF NOT EXISTS `Things` (`id` INTEGER NOT NULL , `createdAt` DATETIME NOT NULL DEFAULT NOW(), `updatedAt` DATETIME NOT NULL DEFAULT NOW(), PRIMARY KEY (`id`)) ENGINE=InnoDB;
Executing (default): SHOW INDEX FROM `Things` FROM `local_dev`
Executing (default): SELECT `id`, `createdAt`, `updatedAt` FROM `Things` AS `Thing`;
```