const asyncHandler = require("express-async-handler");
const Gamer = require("../models/Gamer");
const PC = require("../models/PC");
const moment = require("moment");

const addGamer = asyncHandler(async (req, res) => {
	const { name, money, amountOfTime, pcId, gamerId } = req.body;

	if (gamerId) {
		const gamer = await Gamer.findById(gamerId);

		gamer.startTime = new Date();

		const endTime = moment(gamer.startTime).add(amountOfTime, "m").toDate();

		gamer.endTime = endTime;
		gamer.isPlaying = true;
		gamer.totalMoneyPaid += money;
		gamer.totalTime += amountOfTime;

		const pc = await PC.findOne({ pcNumber: pcId });

		if (pc.isOccupied) {
			res.status(400);
			throw new Error("PC already occupied");
		}

		pc.isOccupied = true;
		pc.currentGamer = gamer._id;

		await pc.save();
		await gamer.save();
		res.status(201).json({ gamer });
	} else {
		const startTime = new Date();

		const endTime = moment(startTime).add(amountOfTime, "m").toDate();

		if (startTime > endTime) {
			res.status(400);
			throw new Error("Invalid time");
		}

		const gamer = new Gamer({
			name,
			startTime,
			endTime,
			isPlaying: true,
			totalMoneyPaid: money,
			totalTime: amountOfTime,
			createdOn: moment(startTime).format("YYYY-MM-DD"),
		});

		const pc = await PC.findOne({ pcNumber: pcId });

		if (pc.isOccupied) {
			res.status(400);
			throw new Error("PC already occupied");
		}

		pc.isOccupied = true;
		pc.currentGamer = gamer._id;

		await pc.save();
		await gamer.save();
		res.status(201).json({ gamer });
	}
});