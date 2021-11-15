 
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
app.get('/forgot-password', (request, response) => 
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
		// console.log(accountAttributes.isAdmin);
		response.render('account',
		{
			accountAttributes: accountAttributes
		});
	})
	.catch((error) =>
	{
		console.log("route(/account) \tresult.catch()");
		console.log("route(/account) \tif loggedIn === false");
		console.log(error);
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
	// const password 			= request.body.password; 
	const name 				= request.body.name;

    console.log(currentEmail);
	console.log(newEmail);
    console.log(password);
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
		response.render('menu'); 
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
 
		console.log("email, password: "); 
		console.log(email); 
		console.log(password); 
 
		const db = dbService.getDbServiceInstance(); 
		const result = db.getUserData(email, password); 
		var loggedIn = false;
		// console.log(1111);
		result.then(results => 
		{ 
				// console.log(3333);
			// 	console.log("loggedIn === true"); 
			// 	loggedIn = true;

			// if (loggedIn === true) 
			// { 
				console.log("route(/auth) \tif loggedIn === true"); 
				let options = 
				{ 
					maxAge: 1000 * 60 * 20160, // Would expire after two weeks (20160 minutes)
					httpOnly: false, // The cookie only accessible by the web server 
					signed: false // Indicates if the cookie should be signed 
				} 
 
				// Set cookie 
				response.cookie('email', email, options) // options is optional 
				response.cookie('password', password, options) // options is optional 
 
				console.log("Cookies created: email, password"); 
				// response.redirect('/menu'); 
				response.json(true); 
 
			// } 
 
			// if (loggedIn === false) 
			// { 
			// 	console.log("route(/auth) \tif loggedIn === false"); 
 
			// 	// expire the false cookies 
			// 	var options = 
			// 	{ 
			// 		maxAge: 1000 * 60 * 0, // Would expire after 0.0 hours  
			// 		httpOnly: false, // The cookie only accessible by the web server 
			// 		signed: false // Indicates if the cookie should be signed 
			// 	} 
 
			// 	// Set cookie 
			// 	response.cookie('email', email, options) // options is optional 
			// 	response.cookie('password', password, options) // options is optional 
			// 	response.json(loggedIn); 
			// } 
			// if logged out, route to /login 
 
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
 
// render 
app.get('/getMenuData', (request, response) => 
{ 
	console.log("\n" + "route(/getMenuData) "); 
	const db = dbService.getDbServiceInstance(); 
	const result = db.getMenuData(); 
 
	var loggedInResponse = checkIfLoggedIn(request); 
	loggedInResponse.then((accountAttributes) => 
	{ 
		result.then(data =>  
		{ 
			console.log(data); 
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
app.get('/getCartData', (request, response) => 
{ 
	// console.log("\n"+ "route(/getCartData) "); 
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
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
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
		console.log("route(/) \tresult.catch()"); 
		console.log("route(/) \tif loggedIn === false"); 
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
			const { orderId, status } = request.body; 
			const db = dbService.getDbServiceInstance(); 
			const result = db.adminUpdateOrderStatus(orderId, status); 
		 
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
			console.log("loggedIn === true");
			// console.log(2222);
			console.log(results);
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
