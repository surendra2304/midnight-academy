-- Structured practice tests: predefined tests students can take without a code.
-- Adds is_practice to tests, creates a system instructor account to own the
-- seed content, and inserts 3 practice tests per category (18 total) with
-- 3 approved questions each. Idempotent: re-running inserts nothing new.

alter table public.tests
  add column if not exists is_practice boolean not null default false;

-- System instructor that owns the seeded practice content
insert into auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values (
  '9a1c0000-0000-4000-8000-000000000001',
  'practice.library@midnightacademy.dev',
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Practice Library"}'::jsonb
) on conflict (id) do nothing;

insert into public.profiles (id, email, full_name, institution, onboarded)
values ('9a1c0000-0000-4000-8000-000000000001', 'practice.library@midnightacademy.dev', 'Practice Library', 'SRKR Engineering College, Bhimavaram', true)
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
values ('9a1c0000-0000-4000-8000-000000000001', 'admin')
on conflict do nothing;

-- Helper: insert a practice test (idempotent on code)
create or replace function public.seed_practice_test(
  _code text, _name text, _category text, _difficulty text, _questions int
) returns uuid language sql as $$
  insert into public.tests (owner_id, name, category, difficulty, question_count,
    seconds_per_question, response_seconds, status, code, is_practice)
  values ('9a1c0000-0000-4000-8000-000000000001', _name, _category, _difficulty, _questions,
    25, 90, 'active', _code, true)
  on conflict (code) do nothing
  returning id;
$$;

-- Helper: add a question to a test code (skips if the test already has questions)
create or replace function public.seed_practice_question(
  _test_code text, _position int, _text text, _topic text, _difficulty text,
  _concepts text[], _constraints text[], _reference text
) returns void language sql as $$
  insert into public.questions (test_id, position, text, category, topic, difficulty,
    concepts, constraints, reference_answer, approved)
  select t.id, _position, _text, t.category, _topic, _difficulty,
    _concepts, _constraints, _reference, true
  from public.tests t
  where t.code = _test_code
    and not exists (select 1 from public.questions q where q.test_id = t.id and q.position = _position);
$$;

-- ============ DSA ============
select public.seed_practice_test('PRC-DSA01', 'DSA Practice Test 1: Arrays & Strings', 'DSA', 'Easy', 3);
select public.seed_practice_question('PRC-DSA01', 0,
  'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to the target. Exactly one solution exists and the same element may not be used twice.',
  'Arrays & Hashing', 'Easy',
  array['Complement lookup','Hash map','One-pass iteration'],
  array['Exactly one solution','Same element not used twice'],
  'Iterate the array once keeping a hash map from value to index. For each number, compute target minus the number and check the map; a hit gives both indices. Linear time, linear space.');
select public.seed_practice_question('PRC-DSA01', 1,
  'Given a string s, return the length of the longest substring without repeating characters.',
  'Sliding Window', 'Medium',
  array['Sliding window','Hash set','Two pointers'],
  array['Substring must be contiguous','Characters cannot repeat within the window'],
  'Maintain a sliding window with a set of seen characters. Expand the right end each step; when a duplicate appears, shrink from the left until unique. Track the maximum window length.');
select public.seed_practice_question('PRC-DSA01', 2,
  'Given an integer array nums, find the contiguous subarray with the largest sum and return that sum.',
  'Kadane''s Algorithm', 'Medium',
  array['Dynamic programming','Running maximum','Subarray contiguity'],
  array['Subarray must be contiguous','At least one element must be chosen'],
  'Use Kadane''s algorithm: keep the best sum ending at the current index, resetting when the running sum would be improved by starting fresh, and track the global maximum.');

select public.seed_practice_test('PRC-DSA02', 'DSA Practice Test 2: Linked Lists & Stacks', 'DSA', 'Medium', 3);
select public.seed_practice_question('PRC-DSA02', 0,
  'Given the head of a singly linked list, reverse the list and return the new head.',
  'Linked Lists', 'Easy',
  array['Pointer manipulation','In-place reversal'],
  array['Singly linked','Do it in-place'],
  'Walk the list with three pointers: previous, current and next. Redirect each node''s link to previous and advance. Previous ends at the new head. Linear time, constant space.');
select public.seed_practice_question('PRC-DSA02', 1,
  'Given a string containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. A string is valid if open brackets are closed by the same type in the correct order.',
  'Stacks', 'Easy',
  array['Stack','Matching pairs','Ordering'],
  array['Only bracket characters','Every closer must match the latest opener'],
  'Push openers onto a stack; on each closer, pop and check the type matches. Valid if the stack is empty at the end and no mismatch occurred.');
select public.seed_practice_question('PRC-DSA02', 2,
  'Implement a queue using two stacks, supporting push, pop and peek operations.',
  'Stacks & Queues', 'Medium',
  array['Amortised analysis','Two-stack technique'],
  array['Only stack operations allowed','Operations must behave like a FIFO queue'],
  'Use an inbox stack for pushes and an outbox stack for pops. When the outbox is empty, transfer everything from the inbox; each element is moved at most twice, so operations are amortised constant time.');

select public.seed_practice_test('PRC-DSA03', 'DSA Practice Test 3: Trees & Graphs', 'DSA', 'Hard', 3);
select public.seed_practice_question('PRC-DSA03', 0,
  'Given the root of a binary tree, return the level order traversal of its nodes'' values, from left to right level by level.',
  'Trees', 'Medium',
  array['Breadth-first search','Queue','Level tracking'],
  array['Left to right within a level','All levels included'],
  'Traverse with a queue, processing one full level per iteration by capturing the current queue size. Collect values level by level.');
select public.seed_practice_question('PRC-DSA03', 1,
  'Given a directed graph and two nodes, determine whether a path exists from the first node to the second.',
  'Graphs', 'Medium',
  array['Graph traversal','Visited set','BFS or DFS'],
  array['Graph is directed','Need only existence, not the path'],
  'Run BFS or DFS from the start node with a visited set to avoid cycles; return true if the target is reached.');
select public.seed_practice_question('PRC-DSA03', 2,
  'Given a grid of ''1''s (land) and ''0''s (water), count the number of islands. An island is land connected horizontally or vertically.',
  'Graphs', 'Hard',
  array['Flood fill','Connected components','Grid as graph'],
  array['Only 4-directional connectivity','Diagonals do not connect'],
  'Scan every cell; when unvisited land is found, increment the count and flood-fill (BFS/DFS) to mark the whole island visited. Each cell is processed once.');

-- ============ DBMS ============
select public.seed_practice_test('PRC-DBMS1', 'DBMS Practice Test 1: SQL Basics', 'DBMS', 'Easy', 3);
select public.seed_practice_question('PRC-DBMS1', 0,
  'Write a SQL query to list all employees in the "Sales" department earning more than 50000, showing name and salary in descending order of salary.',
  'SQL SELECT', 'Easy',
  array['WHERE filtering','ORDER BY','Column projection'],
  array['Only the Sales department','Salary above 50000','Descending salary order'],
  'A single SELECT with a WHERE clause combining department equality and a salary threshold, projecting the required columns and sorting with ORDER BY salary DESC.');
select public.seed_practice_question('PRC-DBMS1', 1,
  'Explain what an INNER JOIN returns between two tables and how it differs from a LEFT JOIN.',
  'Joins', 'Easy',
  array['Inner join semantics','Outer join semantics','NULL handling'],
  array['Compare both join types','Cover unmatched-row behaviour'],
  'INNER JOIN returns only rows with matching keys in both tables. LEFT JOIN returns all left-table rows, filling missing right-side columns with NULLs when no match exists.');
select public.seed_practice_question('PRC-DBMS1', 2,
  'What does the GROUP BY clause do, and how does HAVING differ from WHERE?',
  'Aggregation', 'Medium',
  array['Grouping rows','Aggregate functions','Post-filtering'],
  array['HAVING applies after grouping','WHERE applies before grouping'],
  'GROUP BY collapses rows sharing the grouping key so aggregates like COUNT or AVG produce one value per group. WHERE filters individual rows before grouping; HAVING filters whole groups after aggregation.');

select public.seed_practice_test('PRC-DBMS2', 'DBMS Practice Test 2: Normalization', 'DBMS', 'Medium', 3);
select public.seed_practice_question('PRC-DBMS2', 0,
  'Define First, Second and Third Normal Form (1NF, 2NF, 3NF) in one sentence each.',
  'Normalization', 'Medium',
  array['Atomic values','Full functional dependency','No transitive dependency'],
  array['Each form builds on the previous','One sentence per form'],
  '1NF: every column holds atomic values with no repeating groups. 2NF: 1NF plus no non-key attribute depends on only part of a composite key. 3NF: 2NF plus no non-key attribute depends transitively on the key.');
select public.seed_practice_question('PRC-DBMS2', 1,
  'A table stores student records with columns (roll_no, name, dept_id, dept_name). Identify the normal form violated and how to fix it.',
  'Normalization', 'Medium',
  array['Transitive dependency','Decomposition'],
  array['Identify the violated form','Propose the decomposition'],
  'dept_name depends on dept_id rather than directly on the key — a transitive dependency violating 3NF. Split into Students(roll_no, name, dept_id) and Departments(dept_id, dept_name).');
select public.seed_practice_question('PRC-DBMS2', 2,
  'Explain the trade-off between heavy normalization and query performance.',
  'Design Trade-offs', 'Hard',
  array['Joins cost','Redundancy','Read vs write optimisation'],
  array['Cover both sides of the trade-off'],
  'Heavy normalization removes redundancy and protects write integrity but forces many joins on reads, slowing complex queries. Denormalization speeds specific reads at the cost of redundancy and update anomalies.');

select public.seed_practice_test('PRC-DBMS3', 'DBMS Practice Test 3: Transactions & Indexing', 'DBMS', 'Hard', 3);
select public.seed_practice_question('PRC-DBMS3', 0,
  'State the four ACID properties and describe each in one phrase.',
  'Transactions', 'Medium',
  array['Atomicity','Consistency','Isolation','Durability'],
  array['All four properties','One phrase each'],
  'Atomicity: all or nothing. Consistency: valid state to valid state. Isolation: concurrent transactions do not observe each other''s partial work. Durability: committed data survives crashes.');
select public.seed_practice_question('PRC-DBMS3', 1,
  'What is the difference between a clustered and a non-clustered index?',
  'Indexing', 'Medium',
  array['Physical row order','Secondary lookups'],
  array['Storage difference','Lookup difference'],
  'A clustered index determines the physical order of rows — one per table, typically the primary key. A non-clustered index is a separate structure holding keys and row pointers; many are allowed and lookups may need an extra hop.');
select public.seed_practice_question('PRC-DBMS3', 2,
  'Explain the dirty read problem and which isolation levels prevent it.',
  'Concurrency', 'Hard',
  array['Dirty read','Isolation levels','Locking'],
  array['Define the problem','Name preventing levels'],
  'A dirty read sees another transaction''s uncommitted change, which may later roll back. READ COMMITTED and stricter levels (REPEATABLE READ, SERIALIZABLE) prevent it; READ UNCOMMITTED allows it.');

-- ============ OS ============
select public.seed_practice_test('PRC-OS01', 'OS Practice Test 1: Processes & Threads', 'OS', 'Easy', 3);
select public.seed_practice_question('PRC-OS01', 0,
  'Differentiate a process from a thread.',
  'Processes', 'Easy',
  array['Address space','Resource ownership','Context switch cost'],
  array['Cover memory, ownership and switching'],
  'A process is an independent program in execution with its own address space and resources; a thread is a execution unit inside a process sharing its code, heap and files. Threads switch faster because the address space stays loaded.');
select public.seed_practice_question('PRC-OS01', 1,
  'What information does the Process Control Block (PCB) typically store?',
  'Processes', 'Easy',
  array['Process state','Program counter','Registers','Memory limits'],
  array['Identity plus execution state'],
  'The PCB stores the process id, state, program counter, register snapshot, scheduling priority, memory bounds and open-file table — everything needed to suspend and later resume the process.');
select public.seed_practice_question('PRC-OS01', 2,
  'List the five states of a process life cycle.',
  'Scheduling', 'Medium',
  array['Ready','Running','Blocked'],
  array['Exactly five states'],
  'New, ready, running, blocked (waiting) and terminated. Transitions are admission, dispatch, timeout/event-wait, event-completion and exit.');

select public.seed_practice_test('PRC-OS02', 'OS Practice Test 2: CPU Scheduling', 'OS', 'Medium', 3);
select public.seed_practice_question('PRC-OS02', 0,
  'Explain the Shortest Job First scheduling policy and its main drawback.',
  'Scheduling', 'Medium',
  array['Burst time','Greedy selection','Starvation'],
  array['Define the policy','State the drawback'],
  'SJF runs the process with the smallest estimated CPU burst next, minimising average waiting time. Its drawback: long jobs can starve, and burst lengths must be predicted.');
select public.seed_practice_question('PRC-OS02', 1,
  'Define turnaround time and waiting time for a process.',
  'Scheduling Metrics', 'Easy',
  array['Completion time','Arrival time','Burst time'],
  array['Both metrics defined precisely'],
  'Turnaround time = completion time minus arrival time. Waiting time = turnaround time minus actual CPU burst time — the total time spent ready but not executing.');
select public.seed_practice_question('PRC-OS02', 2,
  'How does Round Robin scheduling work and what role does the time quantum play?',
  'Scheduling', 'Medium',
  array['Circular ready queue','Preemption','Quantum size trade-off'],
  array['Mechanism plus quantum trade-off'],
  'Round Robin runs each ready process for one quantum in circular order, preempting to the back of the queue. Small quanta feel responsive but raise context-switch overhead; large quanta approach first-come-first-served.');

select public.seed_practice_test('PRC-OS03', 'OS Practice Test 3: Memory & Deadlocks', 'OS', 'Hard', 3);
select public.seed_practice_question('PRC-OS03', 0,
  'Explain internal and external fragmentation.',
  'Memory Management', 'Medium',
  array['Fixed partitions','Variable partitions','Compaction'],
  array['Both types defined','Where each occurs'],
  'Internal fragmentation is wasted space inside an allocated block (fixed-size partitions/pages). External fragmentation is free memory scattered between allocations (variable partitions) — too small individually; cured by compaction.');
select public.seed_practice_question('PRC-OS03', 1,
  'State the four necessary conditions for deadlock.',
  'Deadlocks', 'Hard',
  array['Mutual exclusion','Hold and wait','No preemption','Circular wait'],
  array['All four conditions','Named precisely'],
  'Mutual exclusion, hold-and-wait, no-preemption and circular wait. All four must hold simultaneously; breaking any one prevents deadlock.');
select public.seed_practice_question('PRC-OS03', 2,
  'Compare paging and segmentation.',
  'Memory Management', 'Hard',
  array['Fixed-size pages','Variable-size segments','Hardware support'],
  array['Unit sizes','Purpose of division','Fragmentation behaviour'],
  'Paging divides memory into fixed-size frames — simple allocation, no external fragmentation but internal waste. Segmentation divides by logical units of variable size — matches program structure but suffers external fragmentation.');

-- ============ Networks ============
select public.seed_practice_test('PRC-NET1', 'Networks Practice Test 1: OSI Model', 'Networks', 'Easy', 3);
select public.seed_practice_question('PRC-NET1', 0,
  'Name all seven OSI layers in order from physical to application.',
  'OSI Model', 'Easy',
  array['Layer ordering','Encapsulation'],
  array['All seven','Correct order'],
  'Physical, Data Link, Network, Transport, Session, Presentation, Application.');
select public.seed_practice_question('PRC-NET1', 1,
  'Which OSI layer does a router operate at, and what address does it use?',
  'OSI Model', 'Easy',
  array['Network layer','IP addressing','Forwarding'],
  array['Layer plus addressing'],
  'Routers operate at layer 3, the Network layer, forwarding packets using IP addresses.');
select public.seed_practice_question('PRC-NET1', 2,
  'What does the Transport layer add over the Network layer?',
  'Transport Layer', 'Medium',
  array['Process-to-process delivery','Ports','Reliability'],
  array['Contrast with host-to-host delivery'],
  'The Network layer delivers host-to-host; Transport delivers process-to-process using port numbers and, with TCP, adds reliability through sequencing, acknowledgements and retransmission.');

select public.seed_practice_test('PRC-NET2', 'Networks Practice Test 2: TCP vs UDP', 'Networks', 'Medium', 3);
select public.seed_practice_question('PRC-NET2', 0,
  'List three key differences between TCP and UDP.',
  'Transport Protocols', 'Medium',
  array['Connection-oriented vs connectionless','Reliability','Header size'],
  array['At least three clear differences'],
  'TCP is connection-oriented, reliable and ordered with flow/congestion control and a 20+ byte header; UDP is connectionless, best-effort with an 8-byte header and no delivery guarantees.');
select public.seed_practice_question('PRC-NET2', 1,
  'Describe the TCP three-way handshake and its purpose.',
  'TCP', 'Medium',
  array['SYN','SYN-ACK','ACK','Sequence synchronisation'],
  array['All three messages','Purpose stated'],
  'Client sends SYN with an initial sequence number, server replies SYN-ACK acknowledging and proposing its own, client sends ACK. Both sides synchronise sequence numbers and agree the connection is open.');
select public.seed_practice_question('PRC-NET2', 2,
  'Give one real scenario where UDP is preferred over TCP and why.',
  'Application Choice', 'Easy',
  array['Latency sensitivity','Tolerance to loss'],
  array['Concrete scenario','Justification'],
  'Live video or voice calling: late data is useless, so retransmission delays hurt more than occasional loss — UDP''s low overhead and no-blocking delivery fit better.');

select public.seed_practice_test('PRC-NET3', 'Networks Practice Test 3: DNS & HTTP', 'Networks', 'Hard', 3);
select public.seed_practice_question('PRC-NET3', 0,
  'Explain what happens, step by step, when you type a URL into a browser until the page loads.',
  'DNS & HTTP', 'Hard',
  array['DNS resolution','TCP connection','HTTP request/response','Rendering'],
  array['Cover DNS, connection, request and response'],
  'The browser resolves the hostname via DNS (caches, resolver, root/TLD/authoritative servers), opens a TCP (and TLS) connection, sends an HTTP request, receives the response, and fetches/parses referenced resources to render.');
select public.seed_practice_question('PRC-NET3', 1,
  'What is DNS caching and where can DNS records be cached?',
  'DNS', 'Medium',
  array['TTL','Browser cache','OS resolver cache','Recursive resolver cache'],
  array['Define caching','List at least two cache points'],
  'DNS caching stores recent answers to avoid repeated lookups. Records cache in the browser, the OS stub resolver, and recursive resolvers, each honouring the record''s TTL.');
select public.seed_practice_question('PRC-NET3', 2,
  'Distinguish HTTP status codes 301, 404 and 500.',
  'HTTP', 'Easy',
  array['Redirection','Client error','Server error'],
  array['All three classified','Meaning of each'],
  '301 is a permanent redirect (the resource moved); 404 means the client asked for something the server cannot find; 500 signals an unexpected server-side error.');

-- ============ OOP ============
select public.seed_practice_test('PRC-OOP1', 'OOP Practice Test 1: The Four Pillars', 'OOP', 'Easy', 3);
select public.seed_practice_question('PRC-OOP1', 0,
  'Name the four pillars of object-oriented programming with a one-line definition each.',
  'OOP Principles', 'Easy',
  array['Encapsulation','Inheritance','Polymorphism','Abstraction'],
  array['All four named','One line each'],
  'Encapsulation hides internal state behind methods; inheritance reuses behaviour through class hierarchies; polymorphism lets one interface dispatch to many implementations; abstraction exposes essential behaviour while hiding detail.');
select public.seed_practice_question('PRC-OOP1', 1,
  'Explain method overriding versus method overloading.',
  'Polymorphism', 'Medium',
  array['Runtime vs compile time','Signature rules'],
  array['Both defined','Binding time mentioned'],
  'Overriding redefines an inherited method with the same signature, resolved at runtime (dynamic binding). Overloading defines same-named methods with different parameter lists in one class, resolved at compile time.');
select public.seed_practice_question('PRC-OOP1', 2,
  'What is an abstract class and how does it differ from an interface?',
  'Abstraction', 'Medium',
  array['Instantiation','State','Multiple inheritance'],
  array['Both constructs compared'],
  'An abstract class cannot be instantiated, may hold state and mixed concrete/abstract members, and a class extends only one. An interface declares a contract (historically no state) and a class can implement many.');

select public.seed_practice_test('PRC-OOP2', 'OOP Practice Test 2: Design Concepts', 'OOP', 'Medium', 3);
select public.seed_practice_question('PRC-OOP2', 0,
  'Explain composition over inheritance and when you would still choose inheritance.',
  'Design Principles', 'Medium',
  array['Has-a vs is-a','Coupling','Code reuse'],
  array['Both sides of the guidance'],
  'Composition (has-a) delegates to injected objects, keeping behaviour flexible and loosely coupled. Inheritance still fits true is-a hierarchies where subclasses genuinely specialise the base and share its contract.');
select public.seed_practice_question('PRC-OOP2', 1,
  'What does the SOLID "S" principle state and give a violating example.',
  'SOLID', 'Hard',
  array['Single responsibility','Cohesion','Separation of concerns'],
  array['State the principle','Provide a violation'],
  'A class should have one reason to change. A "Report" class that both computes statistics and renders HTML violates it — split into a calculator and a renderer.');
select public.seed_practice_question('PRC-OOP2', 2,
  'Describe the purpose of a constructor and of a destructor/finalizer.',
  'Object Lifecycle', 'Easy',
  array['Initialisation','Resource cleanup','Determinism'],
  array['Both members covered'],
  'A constructor initialises a new object''s state and acquires resources. A destructor/finalizer releases resources when the object is destroyed — deterministic in languages like C++, best-effort with garbage collection elsewhere.');

select public.seed_practice_test('PRC-OOP3', 'OOP Practice Test 3: Advanced Patterns', 'OOP', 'Hard', 3);
select public.seed_practice_question('PRC-OOP3', 0,
  'Explain the Singleton pattern, its typical use, and one criticism.',
  'Design Patterns', 'Medium',
  array['Single instance','Global access','Testability','Hidden dependencies'],
  array['Definition plus use plus criticism'],
  'Singleton guarantees one shared instance with a global access point — used for loggers or configuration. Criticised as disguised global state that hides dependencies and complicates testing and concurrency.');
select public.seed_practice_question('PRC-OOP3', 1,
  'How does the Observer pattern work?',
  'Design Patterns', 'Medium',
  array['Subject','Observers','Notification','Decoupling'],
  array['Mechanism plus decoupling benefit'],
  'A subject maintains a subscriber list and notifies all observers when its state changes. Observers register/unregister freely, so producers and consumers stay decoupled — the backbone of event systems.');
select public.seed_practice_question('PRC-OOP3', 2,
  'Explain dependency injection and the problem it solves.',
  'Design Patterns', 'Hard',
  array['Inversion of control','Testability','Loose coupling'],
  array['Definition plus solved problem'],
  'Dependency injection supplies a class with its collaborators from outside rather than constructing them internally, inverting control. It decouples modules, swaps implementations easily and makes unit testing with fakes trivial.');

-- ============ Aptitude ============
select public.seed_practice_test('PRC-APT1', 'Aptitude Practice Test 1: Quantitative', 'Aptitude', 'Easy', 3);
select public.seed_practice_question('PRC-APT1', 0,
  'A train travels 240 km in 4 hours. If its speed increases by 20 km/h, how long will the same journey take?',
  'Speed & Distance', 'Easy',
  array['Speed = distance / time','Adjusted speed computation'],
  array['New time with increased speed'],
  'Current speed is 60 km/h; increased speed is 80 km/h. Time = 240 / 80 = 3 hours.');
select public.seed_practice_question('PRC-APT1', 1,
  'A shopkeeper marks an item 40% above cost and then offers a 25% discount on the marked price. What is the overall profit or loss percentage?',
  'Profit & Loss', 'Medium',
  array['Mark-up on cost','Successive percentage'],
  array['Net percentage on cost'],
  'Cost 100 becomes marked 140; 25% off gives 105 — a 5% overall profit.');
select public.seed_practice_question('PRC-APT1', 2,
  'Two pipes fill a tank in 12 and 18 hours respectively. How long do they take together?',
  'Time & Work', 'Medium',
  array['Rates add','LCM approach'],
  array['Combined time'],
  'Rates are 1/12 and 1/18 per hour; combined 5/36 per hour, so the tank fills in 36/5 = 7.2 hours (7 hours 12 minutes).');

select public.seed_practice_test('PRC-APT2', 'Aptitude Practice Test 2: Logical Reasoning', 'Aptitude', 'Medium', 3);
select public.seed_practice_question('PRC-APT2', 0,
  'Find the next number in the series: 2, 6, 12, 20, 30, ...',
  'Number Series', 'Medium',
  array['First differences','Pattern of differences'],
  array['Next term with reasoning'],
  'Differences are 4, 6, 8, 10 — increasing by 2, so the next difference is 12 and the next term is 42.');
select public.seed_practice_question('PRC-APT2', 1,
  'If all engineers are graduates, and some graduates are managers, which conclusion definitely follows?',
  'Syllogisms', 'Hard',
  array['Universal premise','Particular premise','Valid inference'],
  array['Only a necessary conclusion'],
  'Nothing definite follows linking engineers to managers — the manager set may exclude engineers entirely. "Some graduates are engineers" is restated, not concluded.');
select public.seed_practice_question('PRC-APT2', 2,
  'A is taller than B but shorter than C. D is taller than C. Who is the tallest?',
  'Ordering Puzzles', 'Easy',
  array['Transitive ordering','Chain comparison'],
  array['Determine the maximum'],
  'Ordering: B < A < C < D, so D is the tallest.');

select public.seed_practice_test('PRC-APT3', 'Aptitude Practice Test 3: Verbal & Data', 'Aptitude', 'Hard', 3);
select public.seed_practice_question('PRC-APT3', 0,
  'A passage states that a policy reduced emissions by 15% while costs rose marginally. What is the main idea to recall?',
  'Reading Comprehension', 'Medium',
  array['Primary outcome','Trade-off awareness'],
  array['Outcome plus the trade-off'],
  'The policy achieved a meaningful 15% emission reduction at only a marginal cost increase — effectiveness with a small trade-off.');
select public.seed_practice_question('PRC-APT3', 1,
  'Sales figures: Q1 120, Q2 150, Q3 135, Q4 180. What is the approximate average quarterly sales and which quarter deviates most from it?',
  'Data Interpretation', 'Medium',
  array['Mean computation','Deviation comparison'],
  array['Average plus the most deviant quarter'],
  'Average is (120+150+135+180)/4 = 146.25 ≈ 146. Deviations: 26, 4, 11, 34 — Q4 deviates most.');
select public.seed_practice_question('PRC-APT3', 2,
  'Rearrange jumbled sentence parts into a coherent statement about cloud adoption, explaining the logic.',
  'Verbal Ability', 'Hard',
  array['Subject-verb-object order','Logical connectors'],
  array['Coherent order plus reasoning'],
  'Read each fragment for grammatical role (subject, verb, object, qualifier), anchor on the subject-verb core, then attach modifiers and connectors until one smooth statement about cloud adoption emerges.');

-- Drop seed helpers (keep the migration clean)
drop function if exists public.seed_practice_test(text, text, text, text, int);
drop function if exists public.seed_practice_question(text, int, text, text, text, text[], text[], text);
