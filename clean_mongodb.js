const fs = require('fs');
const file = fs.readFileSync('src/app/mongodb/MongodbClient.tsx', 'utf-8');

// 1. Remove queryOptions
let newFile = file.replace(/interface QueryOption[\s\S]*?const queryOptions: QueryOption\[\] = \[[\s\S]*?\];/g, '');

// 2. Remove states related to presentation
newFile = newFile.replace(/const \[selectedQuery[\s\S]*?\] = useState.*?;\n/g, '');
newFile = newFile.replace(/const \[dbState[\s\S]*?\] = useState.*?;\n/g, '');
newFile = newFile.replace(/const \[loading, setLoading\] = useState.*?;\n/g, '');
newFile = newFile.replace(/const \[resultsTab, setResultsTab\] = useState.*?;\n/g, '');
newFile = newFile.replace(/const \[queryOutput[\s\S]*?\] = useState[\s\S]*?\]\);\n/g, '');

// 3. Remove checkDatabase, seedDatabase, runQuery
newFile = newFile.replace(/\/\/ Check database status on load[\s\S]*?const checkDatabase = async \(\) => {[\s\S]*?};\n/g, '');
// Remove checkDatabase from useEffect
newFile = newFile.replace(/checkDatabase\(\);\n/g, '');
newFile = newFile.replace(/\/\/ Seed Database Handler[\s\S]*?const seedDatabase = async \(\) => {[\s\S]*?};\n/g, '');
newFile = newFile.replace(/\/\/ Run Query Handler[\s\S]*?const runQuery = async \(\) => {[\s\S]*?};\n/g, '');

// 4. Remove Accordion 2 and extract Vector Search from Accordion 3
newFile = newFile.replace(/\{\/\* Accordion 2: Live Console \*\/\}[\s\S]*?\{\/\* Accordion 3: Vector Search & Graph \*\/\}/g, '');
newFile = newFile.replace(/<Accordion title="Vector Search & AI Graph"[^>]*>([\s\S]*?)<\/Accordion>/g, '$1');

// 5. Remove 'Connected to MongoDB Cluster' header element
newFile = newFile.replace(/\{dbState !== null && \([\s\S]*?\)\}/g, '');

fs.writeFileSync('src/app/mongodb/MongodbClient.tsx', newFile);
console.log('Done');
