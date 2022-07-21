 
const cors = require('cors');
var express = require('express');
var session = require('express-session');
// var bodyParser = require('body-parser');
var path = require('path');
var dotenv = require('dotenv');
dotenv.config();
const cookieParser = require('cookie-parser');
const dbService = require('./dbService');
// no cache saving
// const nocache = require('nocache');

 
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

// no cache
// app.use(nocache());
// no ETag
app.set('etag', false);

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
	loggedInResponse.then((account_attributes) => 
	{
		if (account_attributes.isAdmin == 1)
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
		console.log("route(/) \tif loggedIn == false");
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

// Route to register Page 
app.get('/register', (request, response) => 
{ 
	console.log("\n" + "route(/register)");
	response.render('register');
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

// Route to verify Page 
app.get('/verify', (request, response) => 
{
	console.log("\n" + "route(/verify) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		// console.log('account_attributes');
		// console.table(account_attributes);

		// only send basic attributes
		account_attributes = 
		{
			name: 					account_attributes.name,
			cart:					account_attributes.cart,
			cart_points:			account_attributes.cart_points,
			date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
			date_last_visited:		account_attributes.date_last_visited,
			email_verified:	account_attributes.email_verified
		};
		response.render('verify',
		{
			account_attributes: JSON.stringify(account_attributes)
		});
		
	})
	.catch((error) =>
	{
		// console.log("route(/verify) \tresult.catch()");
		// console.log("route(/verify) \tif loggedIn == false");
		// console.log(error);
		response.redirect('/login');
	});
});

// Route to account Page 
app.get('/account', (request, response) => 
{
	console.log("\n" + "route(/account) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		// console.log('account_attributes');
		// console.table(account_attributes);

		// only send basic attributes
		account_attributes = 
		{
			name: 					account_attributes.name,
			cart:					account_attributes.cart,
			cart_points:			account_attributes.cart_points,
			date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
			date_last_visited:		account_attributes.date_last_visited,
			email_verified:	account_attributes.email_verified
		};
		response.render('account',
		{
			account_attributes: JSON.stringify(account_attributes)
		});
		
	})
	.catch((error) =>
	{
		// console.log("route(/account) \tresult.catch()");
		// console.log("route(/account) \tif loggedIn == false");
		// console.log(error);
		response.redirect('/login');
	});
});


// email all users
// app.get('/emailAllUsers', (request, response) => 
// { 
// 	console.log("/emailAllUsers");
// 	var loggedInResponse = checkIfLoggedIn(request);
// 	loggedInResponse.then((account_attributes) => 
// 	{
// 		console.log("admin(/emailAllUsers) \tresult.then()");
// 		if (account_attributes.isAdmin == 1) 
// 		{ 
// 			console.log("/emailAllUsers ADMIN TRUE");
// 			const db = dbService.getDbServiceInstance();
// 			const result = db.adminEmailAllUsers();
			
// 			result.then(data =>  
// 			{ 
// 				response.json({ data: data });
// 			}) 
// 			.catch(err => console.log(err));			
// 		} 
// 		else 
// 		{ 
// 			console.log("/emailAllUsers ADMIN FALSE");
// 			response.end();
// 		} 
// 	})
// 	.catch(() => 
// 	{
// 		console.log("route(/emailAllUsers) \tresult.catch()");
// 		console.log("route(/emailAllUsers) \tif loggedIn == false");
// 		response.redirect('/login');
// 	});
// });


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

app.patch('/send_verification_code', function(request, response) 
{ 
	console.log("\n" + "route(/send_verification_code)");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		const db = dbService.getDbServiceInstance();
		const result = db.send_verification_code(account_attributes);
		result.then(data =>
		{
			response.json(true);
		})
		.catch((error) => 
		{ 
			console.log("route(/send_verification_code) \tresult.catch()");
			console.log(error);
			response.json(false);
		});

	})
	.catch(() => 
	{ 
		console.log("route(/send_verification_code) \tresult.catch()");
		console.log("route(/send_verification_code) \tif loggedIn == false");
		response.redirect('/login');
	});
});

app.patch('/updateAccountAttributes', function(request, response) 
{ 
	console.log("\n" + "route(/updateAccountAttributes)");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		const new_email 			= request.body.new_email;
		const new_name 				= request.body.new_name;

		const db = dbService.getDbServiceInstance();
		const result = db.updateAccountAttributes(account_attributes, new_email, new_name);
	
		result.then(data =>
		{
			var options = 
			{ 
				maxAge: 1000 * 60 * 20160, // Would expire after two weeks (20160 minutes)
				httpOnly: false, // The cookie only accessible by the web server 
				signed: false // Indicates if the cookie should be signed 
			} 

			// Set cookie 
			response.cookie('email', new_email, options) // options is optional 

			// response
			response.json(true);
		})
		.catch((error) => 
		{
			console.log("route(/updateAccountAttributes) \tresult.catch()");
			console.log(error);
			response.json(error);
		});
	})
	.catch(() => 
	{ 
		console.log("route(/updateAccountAttributes) \tresult.catch()");
		console.log("route(/updateAccountAttributes) \tif loggedIn == false");
		response.redirect('/login');
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

app.patch('/submit_verification_code', function(request, response) 
{ 
	console.log("\n" + "route(/submit_verification_code)");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		const verification_code = request.body.verification_code;

		const db = dbService.getDbServiceInstance();
		const result = db.submit_verification_code(account_attributes, verification_code);
	
		result.then(data =>
		{
			response.json(true);
		})
		.catch((error) => 
		{
			console.log("route(/submit_verification_code) \tresult.catch()");
			console.log(error);
			response.json(false);
		});
	})
	.catch(() => 
	{ 
		console.log("route(/submit_verification_code) \tresult.catch()");
		console.log("route(/submit_verification_code) \tif loggedIn == false");
		response.redirect('/login');
	});

});

 
// render 
app.get('/menu', function (request, response) 
{ 
	console.log("\n" + "route(/menu)");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		// console.log(account_attributes);
		// console.table(account_attributes);

		// only send basic attributes
		account_attributes = 
		{
			name: 					account_attributes.name,
			cart:					account_attributes.cart,
			cart_points:			account_attributes.cart_points,
			date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
			date_last_visited:		account_attributes.date_last_visited,
			email_verified:	account_attributes.email_verified
		};
		response.render('menu',
		{
			account_attributes: JSON.stringify(account_attributes)
		});
		
	})
	.catch(() => 
	{ 
		console.log("route(/menu) \tresult.catch()");
		console.log("route(/menu) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// render 
// app.get('/rewards', function (request, response) 
// { 
// 	console.log("\n" + "route(/rewards)");
// 	var loggedInResponse = checkIfLoggedIn(request);
// 	loggedInResponse.then((account_attributes) => 
// 	{

	// 		// console.log(account_attributes);
	// 		// console.table(account_attributes);


			// // only send basic attributes
			// account_attributes = 
			// {
			// 	name: 					account_attributes.name,
			// 	cart:					account_attributes.cart,
			// 	cart_points:			account_attributes.cart_points,
			// 	date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
			// 	date_last_visited:		account_attributes.date_last_visited,
			// 	email_verified:	account_attributes.email_verified
			// };
			// response.render('rewards',
			// {
			// 	account_attributes: JSON.stringify(account_attributes)
			// });
// 	})
// 	.catch(() => 
// 	{ 
// 		console.log("route(/rewards) \tresult.catch()");
// 		console.log("route(/rewards) \tif loggedIn == false");
// 		response.redirect('/login');
// 	});
// });

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
app.get('/get_menu', (request, response) => 
{ 
	// console.log("\n" + "route(/get_menu) ");
	const db = dbService.getDbServiceInstance();
	const result = db.get_menu();
 
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/get_menu) \tresult.catch()");
		console.log("route(/get_menu) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// render 
app.get('/checkout', (request, response) => 
{ 
	console.log("\n" + "route(/checkout)");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		// only send basic attributes
		account_attributes = 
		{
			name: 					account_attributes.name,
			cart:					account_attributes.cart,
			cart_points:			account_attributes.cart_points,
			date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
			date_last_visited:		account_attributes.date_last_visited,
			email_verified:	account_attributes.email_verified
		};
		response.render('checkout',
		{
			account_attributes: JSON.stringify(account_attributes)
		});
		
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()");
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});
 
// render 
app.get('/orders', (request, response) => 
{ 
	console.log("\n" + "route(/orders)");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		// only send basic attributes
		account_attributes = 
		{
			name: 					account_attributes.name,
			cart:					account_attributes.cart,
			cart_points:			account_attributes.cart_points,
			date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
			date_last_visited:		account_attributes.date_last_visited,
			email_verified:	account_attributes.email_verified
		};
		response.render('orders',
		{
			account_attributes: JSON.stringify(account_attributes)
		});
		
	}) 
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()");
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read 
app.get('/getUserData', (request, response) => 
{ 
	// console.log("\n"+ "route(/getUserData) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read 
app.get('/getUserOrders', (request, response) => 
{ 
	// console.log("\n"+ "route(/getUserOrders) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read  
app.get('/adminGetUserOrders', (request, response) => 
{
	console.log("/adminGetUserOrders");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("admin(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
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
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read  
app.get('/get_sale_times', (request, response) => 
{
	console.log("/get_sale_times");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) =>
	{
		console.log("/get_sale_times ADMIN TRUE");
		const db = dbService.getDbServiceInstance();
		const result = db.admin_get_admin_config();
		result.then(data =>  
		{
			response.json(data);
		})
		.catch(err => console.log(err));
	})
	.catch(() => 
	{
		console.log("route(/get_sale_times) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read  
app.get('/admin_get_admin_config', (request, response) => 
{
	console.log("/admin_get_admin_config");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) =>
	{
		console.log("admin(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
		{
			console.log("/admin_get_admin_config ADMIN TRUE");
			const db = dbService.getDbServiceInstance();
			const result = db.admin_get_admin_config();
			
			result.then(data =>  
			{
				response.json(data);
			})
			.catch(err => console.log(err));			
		}
		else 
		{
			console.log("/admin_get_admin_config ADMIN FALSE");
			response.end();
		}
	})
	.catch(() => 
	{
		console.log("route(/admin_get_admin_config) \tif loggedIn == false");
		response.redirect('/login');
	});
});


// read  
app.get('/adminGetUserPickups', (request, response) => 
{
	console.log("/adminGetUserPickups");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("admin(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
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
		console.log("route(/adminGetUserPickups) \tresult.catch()");
		console.log("route(/adminGetUserPickups) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read  
app.patch('/ordersCustomerGetPickupDaysAndTimes', (request, response) => 
{
	console.log("/ordersCustomerGetPickupDaysAndTimes");
	const { customerDate } = request.body;

	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/ordersCustomerGetPickupDaysAndTimes) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read  
app.get('/getPickupAvailabilityDays', (request, response) => 
{
	console.log("/getPickupAvailabilityDays");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/getPickupAvailabilityDays) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read  
app.get('/getPickupAvailabilityTimes', (request, response) => 
{
	console.log("/getPickupAvailabilityTimes");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/getPickupAvailabilityTimes) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read 
app.get('/adminGetAccessCodes', (request, response) => 
{  
	console.log("/adminGetAccessCodes");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("admin(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
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
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});


// post 
app.post('/generateAccessCodes', (request, response) => 
{  
	console.log("/generateAccessCodes");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("admin(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
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
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});
 
// render 
app.get('/admin', (request, response) => 
{ 
	console.log("\n" + "route(/admin) ");
 
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("admin(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
		{ 
			// only send basic attributes
			account_attributes = 
			{
				name: 					account_attributes.name,
				cart:					account_attributes.cart,
				cart_points:			account_attributes.cart_points,
				date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
				date_last_visited:		account_attributes.date_last_visited,
				email_verified:	account_attributes.email_verified
			};
			response.render('admin',
			{
				account_attributes: JSON.stringify(account_attributes)
			});
		} 
		else 
		{ 
			response.redirect('/');
		}
		
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()");
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read 
app.get('/help', (request, response) => 
{ 
	console.log("\n" + "route(/help) ");
 
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{ 
		console.log("help(/) \tresult.then()");
		// only send basic attributes
		account_attributes = 
		{
			name: 					account_attributes.name,
			cart:					account_attributes.cart,
			cart_points:			account_attributes.cart_points,
			date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
			date_last_visited:		account_attributes.date_last_visited,
			email_verified:	account_attributes.email_verified
		};
		response.render('help',
		{
			account_attributes: JSON.stringify(account_attributes)
		});
		
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()");
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// read 
app.get('/feedback', (request, response) => 
{ 
	console.log("\n" + "route(/feedback) ");

	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) =>
	{
		console.log("feedback(/) \tresult.then()");

		// only send basic attributes
		account_attributes = 
		{
			name: 					account_attributes.name,
			cart:					account_attributes.cart,
			cart_points:			account_attributes.cart_points,
			date_lastOrderPlaced:	account_attributes.date_lastOrderPlaced,
			date_last_visited:		account_attributes.date_last_visited,
			email_verified:	account_attributes.email_verified
		};
		response.render('feedback',
		{
			account_attributes: JSON.stringify(account_attributes)
		});
		
	})
	.catch(() =>
	{
		console.log("route(/) \tresult.catch()");
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});
 
// update 
app.patch('/cartAddItem', (request, response) => 
{
	// console.log("\n"+ "route(/cartAddItem) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/cartAddItem) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// update 
app.patch('/cartSubtractItem', (request, response) => 
{ 
	// console.log("\n"+ "route(/cartSubtractItem) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/cartSubtractItem) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// removes all items from cart AND cart_points
// patch 
app.patch('/cartRemoveAllItems', (request, response) => 
{
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{ 
		// console.log("\n"+ "route(/cartRemoveAllItems) ");
		const email = request.cookies.email;
		const password = request.cookies.password;
		const db = dbService.getDbServiceInstance();
		const result = db.cartRemoveAllItems(email, password);
	
		result.then(data => 
		{ 
			// console.log("\n" + "route(/cartRemoveAllItems) \t RESULTS:");
			response.json({ data: data });
		}) 
		.catch(err => console.log(err));
	})
	.catch(() => 
	{
		// user is not logged in
		console.log("route(/cartRemoveAllItems) \tresult.catch()");
		// console.log("route(/cartRemoveAllItems) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// update 
app.patch('/setCartPointsData', (request, response) => 
{
	// console.log("\n"+ "route(/setCartPointsData) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		const email		= request.cookies.email;
		const password	= request.cookies.password;
		var { itemId }	= request.body;
		var itemQty 	= 1;
		const db = dbService.getDbServiceInstance();

		// create user cart object
		var cart = [[itemId, itemQty]];
		var jsonObject =
		{
			cart: cart // jsonName : values
		};
		jsonObject = JSON.stringify(jsonObject);

		const result = db.setCartPointsData(email, password, jsonObject);
		result.then(data => 
		{ 
			// console.log("\n" + "route(/setCartPointsData) \t RESULTS:");
			response.json({ data: data });
		}) 
		.catch(err => console.log(err));
	})
	.catch(() => 
	{ 
		console.log("route(/setCartPointsData) \tresult.catch()");
		console.log("route(/setCartPointsData) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// patch 
app.patch('/cartPointsRemoveAllItems', (request, response) => 
{
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{ 
		// console.log("\n"+ "route(/cartPointsRemoveAllItems) ");
		const email = request.cookies.email;
		const password = request.cookies.password;
		const db = dbService.getDbServiceInstance();
		const result = db.cartPointsRemoveAllItems(email, password);
	
		result.then(data => 
		{ 
			// console.log("\n" + "route(/cartPointsRemoveAllItems) \t RESULTS:");
			response.json({ data: data });
		}) 
		.catch(err => console.log(err));
	})
	.catch(() => 
	{
		// user is not logged in
		console.log("route(/cartPointsRemoveAllItems) \tresult.catch()");
		// console.log("route(/cartPointsRemoveAllItems) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// patch 
app.patch('/cartPointsRemoveAllItems', (request, response) => 
{
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{ 
		console.log("\n"+ "route(/cartPointsRemoveAllItems) ");
		const email = request.cookies.email;
		const password = request.cookies.password;
		const db = dbService.getDbServiceInstance();
		const result = db.cartPointsRemoveAllItems(email, password);
	
		result.then(data => 
		{ 
			console.log("\n" + "route(/cartPointsRemoveAllItems) \t RESULTS:");
			response.json({ data: data });
		}) 
		.catch(err => console.log(err));
	})
	.catch(() => 
	{
		// user is not logged in
		console.log("route(/cartPointsRemoveAllItems) \tresult.catch()");
		console.log("route(/cartPointsRemoveAllItems) \tif loggedIn == false");
		response.redirect('/login');
	});
});

app.patch('/update_date_of_last_visit', (request, response) =>
{
	console.log("\n"+ "route(/update_date_of_last_visit) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("update_date_of_last_visit(/) \tresult.then()");

		const { new_DLOV } = request.body;
		const db = dbService.getDbServiceInstance();
		const result = db.update_date_of_last_visit(account_attributes.id, new_DLOV);
		
		console.table(request.body);
		result.then((data) => 
		{
			console.log("\n" + "route(/update_date_of_last_visit) \t new_DLOV Update Success:");
			response.json({ data: data });
		}).catch(err => console.log(err));
	})
	.catch(() => 
	{ 
		console.log("route(/) \tresult.catch()");
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});


app.patch('/adminUpdateOrderStatus', (request, response) =>
{
	console.log("\n"+ "route(/adminUpdateOrderStatus) ");

	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("adminUpdateOrderStatus(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
		{
			const { orderId, status_id, status, user_id } = request.body;
			const db = dbService.getDbServiceInstance();
			const result = db.adminUpdateOrderStatus(orderId, status_id, status, user_id);
		 
			console.table(request.body);

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
		console.log("route(/) \tif loggedIn == false");
		response.redirect('/login');
	});
});

app.patch('/userUpdateScheduledPickup', (request, response) =>
{
	console.log("\n"+ "route(/userUpdateScheduledPickup) ");

	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("userUpdateScheduledPickup(/) \tresult.then()");
		console.log(account_attributes);

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
		console.log("route(/userUpdateScheduledPickup) \tif loggedIn == false");
		response.redirect('/login');
	});
});

app.patch('/adminSetPickupsDays', (request, response) =>
{
	console.log("\n"+ "route(/adminSetPickupsDays) ");

	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("adminSetPickupsDays(/) \tresult.then()");
		console.log(account_attributes);
		if (account_attributes.isAdmin == 1) 
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
		console.log("route(/adminSetPickupsDays) \tif loggedIn == false");
		response.redirect('/login');
	});
});

app.patch('/adminSetPickupsTimes', (request, response) =>
{
	console.log("\n"+ "route(/adminSetPickupsTimes) ");

	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("adminSetPickupsTimes(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
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
		console.log("route(/adminSetPickupsTimes) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// modify
app.patch('/admin_set_sale_times', (request, response) =>
{
	console.log("\n"+ "route(/admin_set_sale_times) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("admin_set_sale_times(/) \tresult.then()");
		if (account_attributes.isAdmin == 1) 
		{ 
			const { start_date, end_date } = request.body;
			const db = dbService.getDbServiceInstance();
			const result = db.admin_set_sale_times(start_date, end_date);
		 
			result.then((data) => 
			{ 
				console.log("\n" + "route(/admin_set_sale_times) Update Success:");
				console.table(request.body);
				response.json(data);
			}).catch(err => console.log(err));
		} 
		else 
		{ 
			response.end();
		} 
	})
	.catch(() => 
	{ 
		console.log("route(/admin_set_sale_times) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// modify
app.patch('/admin_set_menu', (request, response) =>
{
	console.log("\n"+ "route(/admin_set_menu) ");
	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
	{
		console.log("admin_set_menu(/) \tresult.then()");
		if (account_attributes.isAdmin == 1)
		{ 
			const { new_menu } = request.body;
			const db = dbService.getDbServiceInstance();
			const result = db.admin_set_menu(new_menu);
		 
			result.then((data) =>
			{
				console.log("\n" + "route(/admin_set_menu) Update Success:");
				console.table(request.body);
				response.json(true);
			}).catch((err) => 
			{
				response.json(false);
				console.log(err)
			});
		}
		else
		{
			response.end();
		} 
	})
	.catch(() => 
	{ 
		console.log("route(/admin_set_menu) \tif loggedIn == false");
		response.redirect('/login');
	});
});

// create 
app.post('/userPlaceOrder', (request, response) =>  
{
	console.log("\n" + "route(/userPlaceOrder) ");

	var loggedInResponse = checkIfLoggedIn(request);
	loggedInResponse.then((account_attributes) => 
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
		console.log("route(/) \tif loggedIn == false");
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
	loggedInResponse.then((account_attributes) => 
	{ 
		console.log("customerSupportEmailHelpDesk(/) \tresult.then()");

		var { order_id, description } = request.body;

		const db = dbService.getDbServiceInstance();
		const result = db.customerSupportEmailHelpDesk(account_attributes, order_id, description);
		
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
	loggedInResponse.then((account_attributes) => 
	{ 
		console.log("customerSupportEmailFeedback(/) \tresult.then()");

		var { subject, description } = request.body;
		var userEmail = request.cookies.email;

		const db = dbService.getDbServiceInstance();
		const result = db.customerSupportEmailFeedback(account_attributes, subject, description);
		
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
	loggedInResponse.then((account_attributes) => 
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
			console.log("loggedIn == false");
			reject(false);
			return;
		} 
 
		const db = dbService.getDbServiceInstance();
		const result = db.getUserData(email, password);
 
		result.then((results) => // valid login 
		{ 
			// console.log("loggedIn == true");
			// console.log(2222);
			// console.log(results);
			resolve(results);
		})
		.catch(() =>  // invalid login 
		{ 
			console.log("loggedIn == false");
			reject(false);
		});
	});
	return response;
}
 
 
// server listening to PORT 
app.listen(process.env.PORT);


