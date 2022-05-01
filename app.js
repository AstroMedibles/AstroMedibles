 
const cors = require('cors');
var express = require('express'); 
var session = require('express-session'); 
// var bodyParser = require('body-parser'); 
var path = require('path'); 
var dotenv = require('dotenv'); 
dotenv.config(); 
const cookieParser = require('cookie-parser'); 
const { Console } = require('console'); 
const dbService = require('./dbService'); 
 
// express object 
var app = express(); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 
 
// set public folder as root 
app.use(express.static(path.join(__dirname, 'public'))); 
 
// setup Cross-Origin Resource Sharing (CORS) 
// origin: allow data from anywhere 
// credentials: allow cookies 
 
app.use( 
	cors( 
		{ 
			origin: "*", 
			credentials: true 
		} 
	) 
); 
 
// session config 
app.use(session( 
	{ 
		secret: 'secret', 
		resave: true, 
		saveUninitialized: true 
	})); 
 
// setup cookieparser 
app.use(cookieParser("MY SECRET")); 
 
// view engine setup 
app.set('views', path.join(__dirname,'/public/views')); 
app.set('view engine', 'ejs'); 
 
// website root index route  
app.get('/', function (request, response) 
{ 
	console.log("\n" + "route(/) "); 
	// read cookies 
	// Cookies that have not been signed 
	console.log("Cookies: ", request.cookies) 
 
	// Cookies that have been signed 
	console.log("Signed Cookies: ", request.signedCookies) 
 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		if (accountAttributes.isAdmin === 1)
		{
			response.redirect('admin'); 
		} 
		else 
		{ 
			response.redirect('menu'); 
		}
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	}); 
}); 
 
// Route to Login Page 
app.get('/login', (request, response) => 
{ 
	console.log("\n" + "route(/login)"); 
 
	// expire the cookies 
	var options = 
	{ 
		maxAge: 1000 * 60 * 0, // Would expire after 0.0 hours  
		httpOnly: false, // The cookie only accessible by the web server 
		signed: false // Indicates if the cookie should be signed 
	} 
 
	// Set cookie 
	response.cookie('email', "", options) // options is optional 
	response.cookie('password', "", options) // options is optional 
 
	response.render('login'); 
});

// Route to ForgotPassword Page 
app.get('/forgotPassword', (request, response) => 
{ 
	console.log("\n" + "route(/forgot-password)"); 
 
	// expire the cookies 
	var options = 
	{ 
		maxAge: 1000 * 60 * 0, // Would expire after 0.0 hours  
		httpOnly: false, // The cookie only accessible by the web server 
		signed: false // Indicates if the cookie should be signed 
	} 
 
	// Set cookie 
	response.cookie('email', "", options) // options is optional 
	response.cookie('password', "", options) // options is optional 
 
	response.render('forgot-password'); 
});

// Route to account Page 
app.get('/account', (request, response) => 
{ 
	console.log("\n" + "route(/account) "); 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		// console.log('accountAttributes');
		// console.table(accountAttributes);

		response.render('account',
		{
			accountAttributes: accountAttributes
		});
	})
	.catch((error) =>
	{
		// console.log("route(/account) \tresult.catch()");
		// console.log("route(/account) \tif loggedIn === false");
		// console.log(error);
		response.redirect('/login'); 
	});
});

app.patch('/forgotPasswordGenerateCode', function(request, response) 
{ 
	console.log("\n" + "route(/forgotPasswordGenerateCode)");
	const email = request.body.email;

	const db = dbService.getDbServiceInstance();
	const result = db.forgotPasswordGenerateCode(email);
 
	result.then(data =>
	{
		response.json({ data: data });
	})
	.catch((error) => 
	{ 
		console.log("route(/forgotPasswordGenerateCode) \tresult.catch()");
		console.log(error);
		response.json(false);
	});
});

app.patch('/updateAccountAttributes', function(request, response) 
{ 
	console.log("\n" + "route(/updateAccountAttributes)");
	const currentEmail 		= request.cookies.email; 
	const password 			= request.cookies.password; 

	const newEmail 			= request.body.email; 
	const name 				= request.body.name;

    console.log(currentEmail);
	console.log(newEmail);
    // console.log(password);
	console.log('***');
    console.log(name);

	const db = dbService.getDbServiceInstance(); 
	const result = db.updateAccountAttributes(currentEmail, newEmail, password, name); 
 
	result.then(data =>
	{
		var options = 
		{ 
			maxAge: 1000 * 60 * 20160, // Would expire after two weeks (20160 minutes)
			httpOnly: false, // The cookie only accessible by the web server 
			signed: false // Indicates if the cookie should be signed 
		} 

		// Set cookie 
		response.cookie('email', newEmail, options) // options is optional 
		response.cookie('password', password, options) // options is optional 

		// response
		response.json(true);
	})
	.catch((error) => 
	{
		console.log("route(/updateAccountAttributes) \tresult.catch()"); 
		console.log(error); 
		response.json(error);
	});
});

app.patch('/updatePassword', function(request, response) 
{ 
	console.log("\n" + "route(/updatePassword)");
	const email 			= request.body.email; 
	const password 			= request.body.password; 
	const verificationCode 	= request.body.verificationCode; 

    console.log(email);
    console.log(password);
    console.log(verificationCode);

	const db = dbService.getDbServiceInstance(); 
	const result = db.updatePassword(email, password, verificationCode); 
 
	result.then(data =>
	{
		response.json({ data: data });
	})
	.catch((error) => 
	{
		console.log("route(/updatePassword) \tresult.catch()"); 
		console.log(error); 
		response.json(false);
	});
});

// render 
app.get('/register', (request, response) => 
{ 
	console.log("\n" + "route(/register)"); 
	response.render('register'); 
}); 
 
// render 
app.get('/menu', function (request, response) 
{ 
	console.log("\n" + "route(/menu)"); 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		// console.log("accountAttributes.date_lastOrderPlaced");
		// console.log(accountAttributes.date_lastOrderPlaced);

		// console.log(accountAttributes);
		// console.table(accountAttributes);

		response.render('menu',
		{
			dlop: accountAttributes.date_lastOrderPlaced
		}); 
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	}); 
}); 
 
app.post('/auth', function (request, response) 
{ 
	console.log("\n" + "route(/auth)"); 
 
	try 
	{ 
		// check  
		const email = request.body.email; 
		const password = request.body.password; 
 
		// console.log("email, password: "); 
		// console.log(email); 
		// console.log(password); 
 
		const db = dbService.getDbServiceInstance(); 
		const result = db.getUserData(email, password); 
		var loggedIn = false;
		// console.log(1111);
		result.then(results => 
		{ 
			let options = 
			{ 
				maxAge: 1000 * 60 * 20160, // Would expire after two weeks (20160 minutes)
				httpOnly: false, // The cookie only accessible by the web server 
				signed: false // Indicates if the cookie should be signed 
			} 

			// Set cookie 
			response.cookie('email', email, options) // options is optional 
			response.cookie('password', password, options) // options is optional 

			// console.log("Cookies created: email, password"); 
			// response.redirect('/menu'); 
			response.json(true); 
 
		}).catch((dataResult) => 
		{ 
			console.log("route(/auth) \tresult.catch()"); 
			console.log(dataResult); 
			var options = 
			{
				maxAge: 1000 * 60 * 0, // Would expire after 0.0 hours  
				httpOnly: false, // The cookie only accessible by the web server 
				signed: false // Indicates if the cookie should be signed 
			} 

			// Set cookie 
			response.cookie('email', email, options) // options is optional 
			response.cookie('password', password, options) // options is optional 
			response.json(false); 			
		}); 
	} 
	catch (error)  
	{ 
		console.log("route(/auth) \tError:" + error); 
		response.redirect('/login'); 
	}
}); 
 
// read 
app.get('/getMenuData', (request, response) => 
{ 
	// console.log("\n" + "route(/getMenuData) "); 
	const db = dbService.getDbServiceInstance(); 
	const result = db.getMenuData(); 
 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		result.then(data =>  
		{ 
			// console.log(data); 
			response.json({ data: data });
		})
		.catch(err => console.log(err)); 
	}) 
	.catch(() => 
	{ 
		console.log("route(/getMenuData) \tresult.catch()"); 
		console.log("route(/getMenuData) \tif loggedIn === false"); 
		response.redirect('/login'); 
	}); 
});

// render 
app.get('/checkout', (request, response) => 
{ 
	console.log("\n" + "route(/checkout)"); 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		response.render('checkout'); 
	}) 
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	}); 
}); 
 
// render 
app.get('/orders', (request, response) => 
{ 
	console.log("\n" + "route(/orders)"); 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		response.render('orders'); 
	}) 
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	}); 
}); 
 
// render 
app.get('/ThankYou', (request, response) => 
{ 
	console.log("\n" + "route(/ThankYou)"); 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		response.render('ThankYou'); 
	}) 
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	}); 
}); 

// read 
app.get('/getUserData', (request, response) => 
{ 
	// console.log("\n"+ "route(/getUserData) "); 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		const email = request.cookies.email; 
		const password = request.cookies.password; 
		const db = dbService.getDbServiceInstance(); 
		const result = db.getUserData(email, password); 
		result 
		.then(data =>  
		{ 
			response.json({ data: data });
		})
		.catch(err => console.log(err));
	}) 
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	}); 
});

// read 
app.get('/getUserOrders', (request, response) => 
{ 
	// console.log("\n"+ "route(/getUserOrders) "); 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		const email = request.cookies.email; 
		const password = request.cookies.password; 
		const db = dbService.getDbServiceInstance(); 
		const result = db.getUserOrders0(email, password); 
	 
		result.then(data =>  
		{ 
			response.json({ data: data });
		})
		.catch(err =>
		{
			console.log(err)
			response.json(null);
		});
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	}); 
});

// read  
app.get('/adminGetUserOrders', (request, response) => 
{
	console.log("/adminGetUserOrders");
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("admin(/) \tresult.then()"); 
		if (accountAttributes.isAdmin === 1) 
		{ 
			console.log("/adminGetUserOrders ADMIN TRUE");
			const db = dbService.getDbServiceInstance(); 
			const result = db.adminGetUserOrders(); 
			
			result.then(data =>  
			{ 
				response.json({ data: data });
			}) 
			.catch(err => console.log(err));			
		} 
		else 
		{ 
			console.log("/adminGetUserOrders ADMIN FALSE");
			response.end();
		} 
	})
	.catch(() => 
	{
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

// read  
app.get('/adminGetUserPickups', (request, response) => 
{
	console.log("/adminGetUserPickups");
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("admin(/) \tresult.then()"); 
		if (accountAttributes.isAdmin === 1) 
		{ 
			console.log("/adminGetUserPickups ADMIN TRUE");
			const db = dbService.getDbServiceInstance(); 
			const result = db.adminGetUserPickups(); 
			
			result.then(data =>  
			{ 
				response.json({ data: data });
			}) 
			.catch(err => console.log(err));			
		} 
		else 
		{ 
			console.log("/adminGetUserPickups ADMIN FALSE");
			response.end();
		} 
	})
	.catch(() => 
	{
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

// read  
app.patch('/ordersCustomerGetPickupDaysAndTimes', (request, response) => 
{
	console.log("/ordersCustomerGetPickupDaysAndTimes");
	const { customerDate } = request.body; 

	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		const db = dbService.getDbServiceInstance(); 
		const result = db.ordersCustomerGetPickupDaysAndTimes(customerDate); 
		
		result.then(data =>  
		{
			// console.log('AVALIBILITY: SENDING RESPONSE');
			response.json({ data: data });
			// console.log('AVALIBILITY: RESPONSE SUCCESS');
		})
		.catch(err => console.log(err));
	})
	.catch(() => 
	{
		console.log("route(/ordersCustomerGetPickupDaysAndTimes) \tresult.catch(error)"); 
		console.log(error) 
		console.log("route(/ordersCustomerGetPickupDaysAndTimes) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

// read  
app.get('/getPickupAvailabilityDays', (request, response) => 
{
	console.log("/getPickupAvailabilityDays");
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		const db = dbService.getDbServiceInstance(); 
		const result = db.getPickupAvailabilityDays(); 
		
		result.then(data =>  
		{
			response.json({ data: data });
		})
		.catch(err => console.log(err));
	})
	.catch(() => 
	{
		console.log("route(/getPickupAvailabilityDays) \tresult.catch(error)"); 
		console.log(error) 
		console.log("route(/getPickupAvailabilityDays) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

// read  
app.get('/getPickupAvailabilityTimes', (request, response) => 
{
	console.log("/getPickupAvailabilityTimes");
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("admin(/) \tresult.then()"); 
		const db = dbService.getDbServiceInstance(); 
		const result = db.getPickupAvailabilityTimes(); 
		
		result.then(data =>  
		{ 
			response.json({ data: data });
		}) 
		.catch(err => console.log(err));			

	})
	.catch((error) => 
	{
		console.log("route(/getPickupAvailabilityTimes) \tresult.catch(error)"); 
		console.log(error)
		console.log("route(/getPickupAvailabilityTimes) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

// read 
app.get('/adminGetAccessCodes', (request, response) => 
{  
	console.log("/adminGetAccessCodes");
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("admin(/) \tresult.then()"); 
		if (accountAttributes.isAdmin === 1) 
		{ 
			console.log("/adminGetAccessCodes ADMIN TRUE");
			const db = dbService.getDbServiceInstance(); 
			const result = db.adminGetAccessCodes(); 
			
			result.then(data =>  
			{
				response.json({ data: data });
			})
			.catch(err => console.log(err));			
		} 
		else 
		{ 
			console.log("/adminGetAccessCodes ADMIN FALSE");
			response.end(); 
		} 
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});


// post 
app.post('/generateAccessCodes', (request, response) => 
{  
	console.log("/generateAccessCodes");
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("admin(/) \tresult.then()"); 
		if (accountAttributes.isAdmin === 1) 
		{ 
			console.log("/generateAccessCodes ADMIN TRUE");
			const db = dbService.getDbServiceInstance(); 
			const result = db.generateAccessCodes(10); 
			
			result.then(data =>  
			{
				response.json({ data: data });
			})
			.catch(err => console.log("/admin error \n" + err));		
		} 
		else 
		{ 
			console.log("/generateAccessCodes ADMIN FALSE");
			response.end(); 
		} 
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});
 
// read 
app.get('/admin', (request, response) => 
{ 
	console.log("\n" + "route(/admin) "); 
 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		console.log("admin(/) \tresult.then()"); 
		if (accountAttributes.isAdmin === 1) 
		{ 
			response.render('admin'); 
		} 
		else 
		{ 
			response.redirect('/'); 
		} 
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

// read 
app.get('/help', (request, response) => 
{ 
	console.log("\n" + "route(/help) "); 
 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		console.log("help(/) \tresult.then()"); 
		response.render('help');
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

// read 
app.get('/feedback', (request, response) => 
{ 
	console.log("\n" + "route(/feedback) "); 
 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		console.log("feedback(/) \tresult.then()"); 
		response.render('feedback');
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});
 
// update 
app.patch('/cartAddItem', (request, response) => 
{
	// console.log("\n"+ "route(/cartAddItem) ");
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		const email = request.cookies.email; 
		const password = request.cookies.password; 
		const { itemId, itemQty } = request.body; 
		const db = dbService.getDbServiceInstance(); 
		const result = db.cartAddItem(email, password, itemId, itemQty); 
	 
		result.then(data => 
		{ 
			console.log("\n" + "route(/cartAddItem) \t RESULTS:"); 
			response.json({ data: data }); 
		}) 
		.catch(err => console.log(err));
	})
	.catch(() => 
	{ 
		console.log("route(/cartAddItem) \tresult.catch()"); 
		console.log("route(/cartAddItem) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
}); 
 
// update 
app.patch('/cartSubtractItem', (request, response) => 
{ 
	// console.log("\n"+ "route(/cartSubtractItem) ");
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		const email = request.cookies.email; 
		const password = request.cookies.password; 
		const { itemId, itemQty } = request.body; 
		const db = dbService.getDbServiceInstance(); 
		const result = db.cartSubtractItem(email, password, itemId, itemQty); 
	 
		result.then(data => 
		{ 
			console.log("\n" + "route(/cartSubtractItem) \t RESULTS:"); 
			response.json({ data: data }); 
		})
		.catch(err => console.log(err));
	})
	.catch(() => 
	{ 
		console.log("route(/cartSubtractItem) \tresult.catch()"); 
		console.log("route(/cartSubtractItem) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
}); 

// patch 
app.patch('/cartRemoveAllItems', (request, response) => 
{
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		console.log("\n"+ "route(/cartRemoveAllItems) "); 
		const email = request.cookies.email; 
		const password = request.cookies.password; 
		const db = dbService.getDbServiceInstance(); 
		const result = db.cartRemoveAllItems(email, password); 
	
		result.then(data => 
		{ 
			console.log("\n" + "route(/cartRemoveAllItems) \t RESULTS:"); 
			response.json({ data: data }); 
		}) 
		.catch(err => console.log(err)); 
	})
	.catch(() => 
	{
		// user is not logged in
		console.log("route(/cartRemoveAllItems) \tresult.catch()"); 
		console.log("route(/cartRemoveAllItems) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
}); 

app.patch('/adminUpdateOrderStatus', (request, response) =>
{
	console.log("\n"+ "route(/adminUpdateOrderStatus) "); 

	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("adminUpdateOrderStatus(/) \tresult.then()"); 
		if (accountAttributes.isAdmin === 1) 
		{
			const { orderId, status_id, status, email } = request.body; 
			const db = dbService.getDbServiceInstance(); 
			const result = db.adminUpdateOrderStatus(orderId, status_id, status, email); 
		 
			result.then((data) => 
			{ 
				console.log("\n" + "route(/adminUpdateOrderStatus) \t RESULTS:"); 
				response.json({ data: data }); 
			}).catch(err => console.log(err));
		} 
		else 
		{ 
			response.end(); 
		} 
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

app.patch('/userUpdateScheduledPickup', (request, response) =>
{
	console.log("\n"+ "route(/userUpdateScheduledPickup) "); 

	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("userUpdateScheduledPickup(/) \tresult.then()");
		console.log(accountAttributes);

		const { orderId, dateScheduledPickup, pickupLocation } = request.body; 
		const db = dbService.getDbServiceInstance();
		const result = db.userUpdateScheduledPickup(orderId, dateScheduledPickup, pickupLocation); 
		
		result.then((data) => 
		{ 
			console.log("\n" + "route(/userUpdateScheduledPickup) \t RESULTS:"); 
			response.json(true); 
		}).catch(err => response.json(false));

	})
	.catch((error) => 
	{ 
		console.log(error);
		console.log("route(/userUpdateScheduledPickup) \tresult.catch()"); 
		console.log("route(/userUpdateScheduledPickup) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

app.patch('/adminSetPickupsDays', (request, response) =>
{
	console.log("\n"+ "route(/adminSetPickupsDays) "); 

	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("adminSetPickupsDays(/) \tresult.then()");
		console.log(accountAttributes);
		if (accountAttributes.isAdmin === 1) 
		{ 
			const { available } = request.body; 
			const db = dbService.getDbServiceInstance(); 
			const result = db.adminSetPickupsDays(available); 
		 
			result.then((data) => 
			{ 
				console.log("\n" + "route(/adminSetPickupsDays) \t RESULTS:"); 
				response.json({ data: data }); 
			}).catch(err => console.log(err));
		} 
		else 
		{ 
			console.log("\n" + "route(/adminSetPickupsDays) \t FAILED, NOT ADMIN:"); 
			response.end(); 
		} 
	})
	.catch((error) => 
	{ 
		console.log(error);
		console.log("route(/adminSetPickupsDays) \tresult.catch()"); 
		console.log("route(/adminSetPickupsDays) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});

app.patch('/adminSetPickupsTimes', (request, response) =>
{
	console.log("\n"+ "route(/adminSetPickupsTimes) "); 

	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		console.log("adminSetPickupsTimes(/) \tresult.then()"); 
		if (accountAttributes.isAdmin === 1) 
		{ 
			const { available } = request.body; 
			const db = dbService.getDbServiceInstance(); 
			const result = db.adminSetPickupsTimes(available); 
		 
			result.then((data) => 
			{ 
				console.log("\n" + "route(/adminSetPickupsTimes) \t RESULTS:"); 
				response.json({ data: data }); 
			}).catch(err => console.log(err));
		} 
		else 
		{ 
			response.end(); 
		} 
	})
	.catch(() => 
	{ 
		console.log("route(/adminSetPickupsTimes) \tresult.catch()"); 
		console.log("route(/adminSetPickupsTimes) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});
 
// create 
app.post('/userPlaceOrder', (request, response) =>  
{
	console.log("\n" + "route(/userPlaceOrder) "); 

	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{
		const email = request.cookies.email; 
		const password = request.cookies.password;
	
		const date = request.body.date; 
	
		// console.log(email);
		// console.log(password);
		// console.log(request.body);
	
		const db = dbService.getDbServiceInstance(); 
		const result = db.submitUserOrder(email, password, date); 
		result 
		.then(() =>  
		{ 
			console.log("\n" + "result(/userPlaceOrder) ");
			console.log('Success');
			response.json(true);
		})
		.catch((err) => 
		{
			console.log('Fail');
			console.log(err)
		});
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
		response.redirect('/login'); 
	});
});
 
// create 
app.post('/register', (request, response) =>  
{ 
	console.log("\n" + ".(/register) POST"); 
	const { name, email, password, code} = request.body; 
	console.log(request.body); 
	const db = dbService.getDbServiceInstance(); 
	const result = db.createUserAccount(name, password, email, code); 
 
	result 
	.then((result) =>  
	{ 
		console.log("\n" + ".then(/register) POST"); 

		var options = 
		{ 
			maxAge: 1000 * 60 * 20160, // Would expire after two weeks (20160 minutes)
			httpOnly: false, // The cookie only accessible by the web server 
			signed: false // Indicates if the cookie should be signed 
		} 

		// Set cookie 
		response.cookie('email', email, options) // options is optional 
		response.cookie('password', password, options) // options is optional 
		console.log("Cookies created: name, password"); 
		response.json(true); 
	}) 
	.catch(err => // Error: Account could not be created 
	{ 
		console.log("/createUserAccount " + "\n" + "Error: Account could not be created"); 
		console.log(err) 
		response.json(false); 
	}); 
}); 

app.post('/customerSupportEmailHelpDesk', (request, response) =>
{
	console.log("\n" + "route(/customerSupportEmailHelpDesk) "); 

	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		console.log("customerSupportEmailHelpDesk(/) \tresult.then()"); 

		var { orderId, description } = request.body;
		var userEmail = request.cookies.email;

		console.log(userEmail);
		console.log(request.body);

		const db = dbService.getDbServiceInstance(); 
		const result = db.customerSupportEmailHelpDesk(userEmail, orderId, description); 
		
		result.then((result) => 
		{
			console.log("\n" + "route(/customerSupportEmailHelpDesk) \t RESULTS: Success"); 
			response.json(true); 
		})
		.catch((err) => 
		{
			console.log("\n" + "route(/customerSupportEmailHelpDesk) \t CATCH:"); 
			console.log(err);
			response.json(false);
		});
	})
	.catch(() => 
	{
		// user is not logged in
		console.log("route(/customerSupportEmailHelpDesk) \tresult.catch()"); 
		response.redirect('/login'); 
	});
});

app.post('/customerSupportEmailFeedback', (request, response) =>
{
	console.log("\n" + "route(/customerSupportEmailFeedback) "); 

	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		console.log("customerSupportEmailFeedback(/) \tresult.then()"); 

		var { subject, description } = request.body;
		var userEmail = request.cookies.email;

		console.log(userEmail);
		console.log(request.body);

		const db = dbService.getDbServiceInstance(); 
		const result = db.customerSupportEmailFeedback(userEmail, subject, description); 
		
		result.then((result) => 
		{
			console.log("\n" + "route(/customerSupportEmailFeedback) \t RESULTS: Success"); 
			response.json(true); 
		})
		.catch((err) => 
		{
			console.log("\n" + "route(/customerSupportEmailFeedback) \t CATCH:"); 
			console.log(err);
			response.json(false);
		});
	})
	.catch(() => 
	{
		// user is not logged in
		console.log("route(/customerSupportEmailFeedback) \tresult.catch()"); 
		response.redirect('/login'); 
	});
});

// delete 
app.delete('/cancelOrder', (request, response) => 
{
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		// console.log("\n"+ "route(/cartAddItem) "); 
		const email = request.cookies.email; 
		const password = request.cookies.password; 
		const { order_id } = request.body; 
		const db = dbService.getDbServiceInstance(); 
		const result = db.cancelOrder(order_id, email, password); 
	
		result.then(data => 
		{ 
			console.log("\n" + "route(/cancelOrder) \t RESULTS:"); 
			response.json({ data: data }); 
		}) 
		.catch(err => console.log(err)); 
	})
	.catch(() => 
	{
		// user is not logged in
		console.log("route(/cancelOrder) \tresult.catch()"); 
		response.redirect('/login'); 
	});
}); 
 
 
// check if user is logged in  
function checkIfLoggedIn(request) 
{ 
	const response = new Promise((resolve, reject) => 
	{ 
		const email = request.cookies.email; 
		const password = request.cookies.password; 
 
		// console.log("email, password: "); 
		// console.log(email); 
		// console.log(password); 
 
		// no login creds 
		if (typeof email === 'undefined' || typeof password === 'undefined') 
		{ 
			console.log("loggedIn === false"); 
			reject(false);
			return; 
		} 
 
		const db = dbService.getDbServiceInstance(); 
		const result = db.getUserData(email, password); 
 
		result.then((results) => // valid login 
		{ 
			// console.log("loggedIn === true");
			// console.log(2222);
			// console.log(results);
			resolve(results);
		})
		.catch(() =>  // invalid login 
		{ 
			console.log("loggedIn === false"); 
			reject(false); 
		});
	});
	return response; 
} 
 
 
// server listening to PORT 
app.listen(process.env.PORT); 
