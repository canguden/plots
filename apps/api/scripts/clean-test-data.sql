-- Clear all test/mock data from ClickHouse events table

-- View what's in there first
SELECT project_id, path, count() as count
FROM events
GROUP BY project_id, path
ORDER BY count DESC
LIMIT 20;

-- To delete ALL events (be careful!):
-- TRUNCATE TABLE events;

-- Or to delete specific test data:
-- DELETE FROM events WHERE path LIKE '/page%';
-- DELETE FROM events WHERE project_id = 'your_test_project_id';
