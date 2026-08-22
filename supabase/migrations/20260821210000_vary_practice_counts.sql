-- Vary the number of predefined practice tests per category (previously an
-- even 3 per category). Target mix: DSA 3, DBMS 3, OS 3, Networks 1,
-- OOP 2, Aptitude 2. Deleting a test cascades its questions and attempts.
delete from public.tests
where code in ('PRC-NET2', 'PRC-NET3', 'PRC-OOP3', 'PRC-APT3')
  and is_practice = true;
