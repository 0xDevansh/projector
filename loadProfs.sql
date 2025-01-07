.mode csv
.import --skip 1 profUsers.csv user

.mode column
.headers on

UPDATE user SET email = TRIM(email), kerberos = TRIM(kerberos);

SELECT COUNT(*) FROM user WHERE type = 'prof';
SELECT * FROM user WHERE type = 'prof' LIMIT 5;