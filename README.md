<!-- npm run dev -->

<!-- https://myaccount.google.com/apppasswords : oztz uyji llum zpcd --> 

<!-- Phase 5: Advanced (Optional Later)
🔔 Notifications API

🧾 PDF Invoice Generator

👨‍🍳 Admin Panel (to add waiters/menu)

📊 Dashboard stats -->

<!-- command to create all tables again in terminal -->
node -e "const db = require('./models'); db.sequelize.sync({ force: true }).then(() => { console.log('All tables created successfully'); process.exit(0); }).catch(err => { console.error('Error creating tables:', err.message); process.exit(1); });"


<!-- server config on vit vps -->
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  'kanban_db',
  'admin',
  'Poonam#@#1988',
  {
    host: 'localhost',
    port: 3306,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;