const faker = require('faker');
const dotenv = require('dotenv');
const argon2 = require('argon2');
const mysql = require('mysql2/promise');
const cityFr = require('./coordsCity.json');
const maleFirstName = require('./manFirstName.json');
const femaleFirstName = require('./womanFirstName.json');
const path = require('path');
const fs = require('fs');
const { SingleBar } = require('cli-progress');

const photosManFolder = './backend/uploads/man';
const photosWomanFolder = './backend/uploads/woman';

dotenv.config();

const connectionConfig = {
	host: 'localhost',
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
};

const getFilesInFolder = (folderPath) => {
	return fs.readdirSync(folderPath);
};

const getRandomPhotos = (photosList, selectedPhotos) => {
	const availablePhotos = photosList.filter(photo => !selectedPhotos.includes(photo));
	const shuffledPhotos = availablePhotos.sort(() => 0.5 - Math.random());
	return shuffledPhotos.slice(0, 5);
};

function generateRandomNumbersArray() {
	const numbersArray = [];

	while (numbersArray.length < 5) {
		const randomNumber = Math.floor(Math.random() * 19) + 1;
		if (!numbersArray.includes(randomNumber)) {
			numbersArray.push(randomNumber);
		}
	}
	return numbersArray;
}

const insertFakeData = async () => {
	const conn = await mysql.createConnection(connectionConfig);

	const progressBar = new SingleBar({
		format: 'Progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}',
		barCompleteChar: '\u2588',
		barIncompleteChar: '\u2591',
		hideCursor: true,
	});

	try {
		const numberOfData = 500;
		progressBar.start(numberOfData, 0);

		for (let i = 0; i < numberOfData; i++) {
			let selectedPhotos = [];
			const gender = faker.random.arrayElement(['man', 'woman']);
			//const email = faker.internet.email();
			const username = faker.internet.userName();
			const firstName = gender === 'man' ? faker.random.arrayElement(maleFirstName) : faker.random.arrayElement(femaleFirstName);
			const lastName = faker.name.lastName();
			const birth = faker.date.between('1970-01-01', '2004-12-31');
			const preference = faker.random.arrayElement(['man', 'woman', 'both']);
			const description = faker.lorem.paragraphs(1).slice(0, 190);
			const all_infos_set = 1;
			const verified = 1;
			const location = faker.random.arrayElement(cityFr);
			const password = faker.internet.password(12, false);
			const hashedPassword = await argon2.hash(password);
			const photosList = gender === 'man' ? getFilesInFolder(photosManFolder) : getFilesInFolder(photosWomanFolder);
			const photos = getRandomPhotos(photosList, selectedPhotos).map((photo) => path.join(gender === 'man' ? './man' : './woman', photo));
			selectedPhotos = selectedPhotos.concat(photos.map(photo => path.basename(photo)));
			const photo1 = photos[0];
			const photo2 = photos[1];
			const photo3 = photos[2];
			const photo4 = photos[3];
			const photo5 = photos[4];

			const sql = 'INSERT INTO user (username, firstName, lastName, birth, gender, preference, description, password, photo1, photo2, photo3, photo4, photo5, all_infos_set, location, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
			const values = [username, firstName, lastName, birth, gender, preference, description, hashedPassword, photo1, photo2, photo3, photo4, photo5, all_infos_set, location, verified];
			const newId = await conn.query(sql, values);

			const interests = generateRandomNumbersArray();
			for (const interest of interests) {
				const sqlInterests = 'INSERT INTO user_tag (user_id, tag_id) VALUES (?, ?)';
				const valuesInterests = [newId[0].insertId, interest];
				await conn.query(sqlInterests, valuesInterests);
			}
			progressBar.update(i + 1);
		}
		progressBar.stop();

		console.log(`${numberOfData} fausses données ont été insérées dans la base de données.`);
	} catch (error) {
		console.error('Erreur lors de l\'insertion des données :', error);
	} finally {
		conn.end();
	}
};

insertFakeData();
