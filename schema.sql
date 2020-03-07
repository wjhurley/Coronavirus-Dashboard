DROP DATABASE IF EXISTS corona;
CREATE DATABASE corona;

\c corona;

CREATE TABLE country (
  id SERIAL primary key,
  name VARCHAR not null
);

CREATE TABLE infections (
  id SERIAL primary key,
  total INTEGER,
  updated VARCHAR,
  country_id INTEGER,
  FOREIGN KEY(country_id) REFERENCES country(id)
);

CREATE TABLE deaths (
  id SERIAL primary key,
  total INTEGER,
  updated VARCHAR,
  country_id INTEGER,
  FOREIGN KEY(country_id) REFERENCES country(id)
);

CREATE TABLE serious (
  id SERIAL primary key,
  total INTEGER,
  updated VARCHAR,
  country_id INTEGER,
  FOREIGN KEY(country_id) REFERENCES country(id)
);

CREATE TABLE recovered (
  id SERIAL primary key,
  total INTEGER,
  updated VARCHAR,
  country_id INTEGER,
  FOREIGN KEY(country_id) REFERENCES country(id)
);
