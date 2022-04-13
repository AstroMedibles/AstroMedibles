const CryptoJS = require("crypto-js");
const dotenv = require('dotenv');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');


var instance = null;
dotenv.config();

const connection = mysql.createPool(
    {
        connectionLimit : 100, // <- Keep an eye on this
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        multipleStatements: true,
        port: process.env.DB_PORT
    });

connection.on('acquire', function (connection)
{
    // console.log('Connection %d acquired', connection.threadId);
});

connection.on('connection', function (connection)
{
    // connection.query('SET SESSION auto_increment_increment=1')
    // console.log('Connection %d event', connection.threadId);
});

connection.on('enqueue', function ()
{
    // console.log('connection enqueue');
    // console.log('Waiting for available connection slot.');
});

connection.on('release', function (connection)
{
    // console.log('Connection %d released', connection.threadId);
});

console.log("\n" + "Server Started:");
// console.log(process.env.HOST);
// console.log(process.env.USER);
// console.log(process.env.PASSWORD);
// console.log(process.env.DATABASE);
// console.log(process.env.TABLE_ITEMS);
// console.log(process.env.TABLE_NAMES);
// console.log(process.env.TABLE_ORDERS);
// console.log(process.env.PORT);
// console.log(process.env.DB_PORT);
console.log("\n");

const address = 'https://astromedibles.com';

class DbService
{
    static getDbServiceInstance()
    {
        return instance ? instance : new DbService();
    }

    async getAllData()
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
            const query1 = "SELECT * FROM " + process.env.TABLE_NAMES + ";";
            const query2 = "SELECT * FROM " + process.env.TABLE_ORDERS + ";";
            connection.query(query1 + query2, [1, 2], (err, results) =>
            {
                if (err) reject(new Error("getAllData ERROR\n" + err.message));
                // console.log(results[0]); // [{1: 1}]
                // console.log(results[1]); // [{2: 2}]
                // console.log("\n");
                resolve(results);
            });

            } catch (error)
            {
                console.log(error);
                reject();
            }
        });
        return response;
    }

    async getUserData(email, password)
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                email = email.toLowerCase();
                const query = "SELECT * FROM " + process.env.TABLE_NAMES + " WHERE email = ?";
                connection.query(query, [email, password], (err, results) =>
                {
                    if (err) 
                    {
                        reject(new Error("dbService.js getUserData(email, password) ERROR\n" + err.message));
                    }

                    try
                    {
                        if (results.length > 0)
                        {
                            var decryptedText = CryptoJS.AES.decrypt(results[0].password, process.env.KEY).toString(CryptoJS.enc.Utf8);
    
                            // console.log('OriginalText: ' + password);
                            // console.log('decryptedText: ' + decryptedText);
    
                            if (password == decryptedText)
                            {
                                // console.log('Login success!');
                                // console.log("results[0]");
                                // console.log(results[0]);
                                resolve(results[0]);
                                return;
                            }
                            else
                            {
                                reject('Wrong password');
                                return;
                            }
                        }
                        else
                        {
                            reject('Wrong email.');
                            return;
                        }
                    } 
                    catch
                    {
                        reject('/getUserData(email, password) - DATABASE ERROR');
                        return;
                    }
                    
                });
            }
            catch (error)
            {
                console.log(error);
                reject(error);
            }
            });
        return response;
    }

    async getMenuData()
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const sql = "SELECT * FROM " + process.env.TABLE_ITEMS + ";";
                connection.query(sql, (err, results) =>
                {
                    if (err) reject(new Error("dbService.js ERROR\n" + err.message));
                    // console.log("\n" + "getMenuData()  Results:");
                    // console.log(results);
                    resolve(results);
                })
            } catch (error)
            {
                console.log(error);
                reject();
            }
        });
        return response;
    }

    // Return's user's cart after action
    async setCartData(email, password, cart)
    {
        const response = await new Promise((resolve, reject) =>
        {
            try
            {
                const query = "UPDATE " + process.env.TABLE_NAMES + " SET cart = ? WHERE email = ?;";
                connection.query(query, [cart, email], (err, results) =>
                {
                    if (err) 
                    {
                        reject(new Error("dbService.js getUserData(email, password) ERROR\n" + err.message));
                    }

                    if (results.length > 0)
                    {
                        var decryptedText = CryptoJS.AES.decrypt(results[0].password, process.env.KEY).toString(CryptoJS.enc.Utf8);

                        // console.log('OriginalText: ' + password);
                        // console.log('decryptedText: ' + decryptedText);

                        if (password == decryptedText)
                        {
                            // console.log('Login success!');
                            resolve(results);
                            return;
                        }
                    }
                    results.affectedRows;     // Save SQL changes
                    cart = JSON.parse(cart); // Return user's cart as JSON object
                    resolve(cart);
                    return;
                });
            } catch (error)
            {
                console.log(error);
                reject(false);
            }
        });
        return response;
    }

    // Return's user's cart after action
    async cartAddItem(email, password, itemId, itemQty)
    {
        const response = await new Promise((resolve, reject) => 
        {
            const db = DbService.getDbServiceInstance();
            // Grab user's cart from database with given email and password
            var cartResult = db.getUserData(email, password);
            cartResult.then(results => 
            {
                var cart = [[0, 0]];
                try
                {
                    // retrieve the user's cart
                    cart = results.cart.cart;
                }
                catch (error)
                {
                    console.log('cartAddItem(email, password, itemId, itemQty)');
                    console.log('cart = results[0].cart.cart; FAILURE');
                    console.log(error);

                    // if user's cart is null, make it an empty array
                    cart = [[0, 0]];
                }

                /*  loop through user's cart
                    if item exists, add to its quantity
                    if item does not exist, add the item's id and its quantity
                */
                let itemIdExists = false;
                for (let index = cart.length - 1; index >= 0; index--)
                {
                    let element = cart[index];    // [itemId, itemQty]
                    let elementId = element[0];     // [0] = itemId
                    let elementQty = element[1];     // [1] = itemQty

                    // if item exists, add to its quantity
                    if (elementId == itemId)
                    {
                        element[1] += itemQty;
                        itemIdExists = true;
                    }
                }
                // if item does not exist, add the item's id and its quantity
                if (itemIdExists == false)
                {
                    cart.push([itemId, itemQty]);
                    // sort ascending by itemId[0] [itemId, itemQty]
                    cart.sort(function (a, b) { return a[0] - b[0] });
                }

                // Add qty to size [[0, (size)], [1,5]]
                cart[0][1] += itemQty;

                // turn user's cart into JSON object for storage into database
                var jsonObject =
                {
                    cart: cart // jsonName : values
                };
                jsonObject = JSON.stringify(jsonObject);

                // store user's cart JSON object into the database
                var setCart = db.setCartData(email, password, jsonObject);
                setCart.then((cartResult) => 
                {
                    // user's cart is now saved
                    // console.log("CartResult: ");
                    // console.log(cartResult);
                    resolve(cartResult);
                });
            }).catch((error) => 
            {
                // If login credentials failed, display error
                console.log("\n" + "async cartAddItem() " + " FAILED LOGIN");
                reject(error);
            });
        });
        return response;
    }

    // Return's user's cart after action
    async cartSubtractItem(email, password, itemId, itemQty)
    {
        const response = await new Promise((resolve, reject) => 
        {
            const db = DbService.getDbServiceInstance();
            // Grab user's cart from database with given email and password
            var cartResult = db.getUserData(email, password);
            cartResult.then(results => 
            {
                console.log("cartSubtractItem .then");
                var cart = [[0, 0]];
                try
                {
                    // retrieve the user's cart
                    cart = results.cart.cart;
                    if (cart.length < 1)
                    {
                        return;
                    }
                }
                catch (error)
                {
                    // if user's cart is null, exit function
                    return;
                }

                /*  loop through user's cart
                    if item exists, remove to its quantity
                */
                let targetIndex = -1

                // for loop, decending index - not necessary though
                for (let index = cart.length - 1; index >= 0; index--)
                {
                    let element = cart[index];
                    let elementId = element[0];
                    let elementQty = element[1];

                    if (elementId == null)
                    {

                    }
                    if (elementId == itemId)
                    {
                        // item found, remove QTY
                        if (elementQty > itemQty)
                        {
                            element[1] -= itemQty;
                        }
                        else
                        {
                            targetIndex = index;
                        }
                        cart[0][1] -= itemQty;
                    }
                }

                if (targetIndex > -1)
                {
                    cart.splice(targetIndex, 1);
                }

                // turn user's cart into JSON object for storage into database
                var jsonObject =
                {
                    cart: cart // jsonName : values
                };
                jsonObject = JSON.stringify(jsonObject);

                // store user's cart JSON object into the database
                var setCart = db.setCartData(email, password, jsonObject);
                setCart.then((cartResult) => 
                {
                    // user's cart is now saved
                    // console.log("CartResult: ");
                    // console.log(cartResult);
                    resolve(cartResult);
                });
            }).catch((error) => 
            {
                // If login credentials failed, display error
                console.log("\n" + "async cartSubtractItem() " + " FAILED LOGIN");
                reject(error);
            });
        });
        return response;
    }

    async cartRemoveAllItems(email, password)
    {
        const db = DbService.getDbServiceInstance();
        const response = await new Promise((resolve, reject) => 
        {
            var jsonObject =
            {
                cart: [[0, 0]] // jsonName : values
            };
            jsonObject = JSON.stringify(jsonObject);

            // store user's cart JSON object into the database
            var setCart = db.setCartData(email, password, jsonObject);
            setCart.then(() => 
            {
                // user's cart is now saved
                resolve(setCart);
            });
        });
        return response;
    }

    // returns [cartItems, cartTotal]
    // cartItems = cart except id is replaced by names [[name, qty]]
    // used for users submitted order
    async cartCalculateTotalCost(cart)
    {
        const response = await new Promise((resolve, reject) => 
        {
            const db = DbService.getDbServiceInstance();
            var cartTotal = 0;
            // copy cart to cartItems
            // var cartItems    = [...cart];
            var menuData = db.getMenuData();
            menuData.then(data => 
            {
                console.log(data);
                // console.log(data['data']);s
                var menuItems = Array.from(data);
                /*  loop through user's cart
                    Add each item's quantity * cost 
                */
                for (let index = 0; index < cart.length; index++)
                {
                    let element = cart[index];      // [itemId, itemQty]
                    let elementId = element[0];     // [0] = itemId
                    let elementQty = element[1];    // [1] = itemQty

                    // for each menu item
                    Array.from(menuItems).forEach(function ({ id, name, price, mg })
                    {
                        if (elementId == id)
                        {
                            // Add name to cartItems
                            cart[index].push(name);
                            // cartTotal += userItemQty * itemPrice
                            cartTotal += (element[1] * price);
                        }
                    });
                }
                // console.log("Cart items:");
                // console.log(cartItems);
                console.log("Calculated total:");
                console.log(cartTotal);
                resolve([cartTotal, menuItems]);
            });
        });
        return response;
    }

    async consumeAccountCreationCode(code)
    {
        const response = await new Promise((resolve, reject) => 
        {
            console.log(`consumeAccountCreationCode(${code})`);
            const query = "DELETE FROM " + process.env.TABLE_CODES + " WHERE (code = ?);";
            connection.query(query, [code], (err, result) =>
            {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    if (result.affectedRows == 0)
                    {
                        reject('No code consumed');
                    }
                    else
                    {
                        console.log(`Code: ${code} CONSUMED`);
                        resolve(result.affectedRows);
                    }
                }
            });
        });
        return response;
    }

    async generateAccessCodes(quantity)
    {
        const response = await new Promise((resolve, reject) => 
        {
            console.log(`generateAccessCodes(${quantity})`);
            var values = [];
            for (let i = 0; i < quantity; i++)
            {
                var code  = Math.random().toString(36).toUpperCase().substr(2,8); // Random 8 char alphanumeric - uppercase only
                console.log(code);
                code = [code];
                values.push(code);
            }
            // values = [values];
            console.log("values");
            console.log(values);
            const sql = "INSERT INTO " + process.env.TABLE_CODES + " (code) VALUES ?";
            connection.query(sql, [values], (err, result) =>
            {
                if (err) 
                {
                    reject(err);
                }
                else
                {    

                    resolve(result.insertId);
                }
            });
        });
        return response;
    }

    async generateAccountCreationSingleCode(code)
    {
        code = code.toUpperCase();

        const response = await new Promise((resolve, reject) => 
        {
            console.log(`generateAccessCodes(${code})`);

            console.log(code);
            code = [code];
            values.push(code);

            console.log("values");
            console.log(values);
            const sql = "INSERT INTO " + process.env.TABLE_CODES + " (code) VALUES ?";
            connection.query(sql, [values], (err, result) =>
            {
                if (err) 
                {
                    reject(err);
                }
                else
                {    

                    resolve(result.insertId);
                }
            });
        });
        return response;
    }

    // create user order
    async submitUserOrder(email, password, date_created)
    {
        const db        = DbService.getDbServiceInstance();
        var userData    = null;
        var user_name   = null;
        var total       = null;
        var menuItems   = null;

        console.log('submitUserOrder(email, password, date_created)');

        console.log(date_created);


        const order_id  = Math.random().toString(36).toUpperCase().substr(2,6); // Random 6 char alphanumeric - uppercase only

        db.submitUserOrderHelper(email, password)
        .then((results) =>
        {
            userData            = results[0];
            total               = results[1][0];
            menuItems           = results[1][1];

            // console.log(userData);
            // console.log(userData.name);

            const user_id       = userData.id;
            const status        = "Payment Required";
            user_name       = userData.name;

            // console.log("user_name");
            const cart          = JSON.stringify(userData.cart);
            // date_created.toLocaleString('en-US', { timeZone: 'America/Chicago' });

            console.log(userData);
            console.log(user_id);
            // console.log(status);
            // console.log(order_id);
            // console.log(user_name);
            // console.log(userData.cart.cart);
            // console.log(total);
            // console.log(date_created);
            
            const insertId = new Promise((resolve, reject) =>
            {
                const query = "INSERT INTO " + process.env.TABLE_ORDERS + " (user_id, status_id, status, order_id, name, email, cart, total, date_created) VALUES (?,?,?,?,?,?,?,?,?);";
    
                connection.query(query, [user_id, 1, status, order_id, user_name, email, cart, total, date_created], (err, result1) =>
                {
                    if (err)
                    {
                        reject(new Error(err.message));
                    }
                    else
                    {
                        // clear user cart
                        db.cartRemoveAllItems(email, password);

                        // set user date_orderLastPlaced to now
                        const query2 = "UPDATE " + process.env.TABLE_NAMES + " SET date_lastOrderPlaced = ? WHERE id = ?;";
                        connection.query(query2, [date_created, user_id], (err, result2) =>
                        {
                            if (err) 
                            {
                                reject(err);
                            }
                            else
                            {
                                resolve([result1.insertId, result2.affectedRows]);
                            }
                        });
                        // resolve(result.insertId);
                    }
                });
            });
            // order created, now email user
            insertId.then((result) =>
            {
                // Email text
                var cartText = "";
                for (let j = 1; j < userData.cart.cart.length; j++)
                {
                    // for each menu item
                    Array.from(menuItems).forEach(function ({ id, name, price, mg })
                    {
                        var elementID = userData.cart.cart[j][0];
                        if (elementID == id)
                        {
                            var cartElement = userData.cart.cart[j];
                            var itemQty     = cartElement[1];
                            cartText += `(${itemQty}) ${name} ($${price} per) <br>`;
                        }
                    });

                }

                var subject = "Strap in " + user_name + ". We're blasting off! 🚀";
                var html = 
                `
                <h3>Your order has been submitted!</h3>
                <p>
                Send your payment to complete your purchase.<br>
                Include your order ID.<br>
                </p>
                <h3>Order Information</h3>
                <p>
                Status:  <a href="https://account.venmo.com/pay?txn=pay&recipients=Astro-Medibles">Payment Required</a><br>
                Order ID:  ${order_id}<br>
                Items:<br>
                ${cartText}
                Total:  $${total.toFixed(2)}<br>
                <br>
                To cancel your order, go to <a href="${address}/MyOrders">My Orders</a>.<br>
                After we confirm your payment, your order status will be updated and you will be notified.
                <br>
                This is an automated message.
                </p>
                `;
                
                db.sendEmail(userData.email, subject, html);
            });



        })
        
    }

    // returns [usersData, usersCartTotal]
    async submitUserOrderHelper(email, password)
    {
        // console.log("submitUserOrderHelper(email, password)");
        // console.log(`submitUserOrderHelper(${email}, ${password})`);
        const db = DbService.getDbServiceInstance();
        var response = new Promise((resolve, reject) => 
        {
            db.getUserData(email, password).then((results) =>
            {
                var cart = results.cart.cart;
                db.cartCalculateTotalCost(cart).then((usersCartTotalResult) =>
                {
                    resolve([results, usersCartTotalResult]);
                });
            });
        });
        return response;
    }

    async createUserAccount(name, password, email, accessCode)
    {
        accessCode = accessCode.toUpperCase();
        email = email.toLowerCase();
        const isAdmin = 0;
        var date_created = new Date().toISOString();
        password = CryptoJS.AES.encrypt(password, process.env.KEY).toString();

        var cart =
        {
            cart: [[0, 0]]
        }
        cart = JSON.stringify(cart);

        const db = DbService.getDbServiceInstance();
        const insertId = new Promise((resolve, reject) =>
        {
            const query = "DELETE FROM " + process.env.TABLE_CODES + " WHERE (code = ?);";
            connection.query(query, [accessCode], (err, result) =>
            {
                if (err)
                {
                    reject(err);
                }
                else // else, no error
                {
                    if (result.affectedRows == 0)
                    {
                        reject('No code consumed, account NOT created.');
                    }
                    else
                    {
                        console.log(`Code: ${accessCode} CONSUMED`);

                        var query2 = "INSERT INTO " + process.env.TABLE_NAMES + " (isAdmin, name, password, cart, email, date_created, verificationCode, date_lastOrderPlaced) VALUES (?,?,?,?,?,?,?,?);";
                        connection.query(query2, [isAdmin, name, password, cart, email, date_created, accessCode, ''], (err, result) =>
                        {
                            if (err) 
                            {
                                // If there was an error, add the unique code back to the DB
                                db.generateAccountCreationSingleCode(accessCode);
                                reject(err);
                            }
                            else
                            {
                                var subject = "Welcome " + name + "! Your account has been created! 🚀";
                                var html = 
                                `
                                <h3>Welcome to the new website!</h3>
                                <p>
                                Head over to <a href="${address}">AstroMedibles.com</a> to start your order.
                                <br>
                                This is an automated message.
                                </p>
                                `;
                                
                                db.sendEmail(email, subject, html);
                                
                                console.log('Account Created!');
                                resolve([result.insertId, result.affectedRows]);
                            }
                        });
                    }
                }
            });
        });
        return insertId;
    }

    async getUserOrders0(email, password)
    {
        const db = DbService.getDbServiceInstance();
        const response = await new Promise((resolve, reject) => 
        {
            db.getUserData(email, password)
            .then(results => 
            {
                var user_id = results.id;
                resolve(db.getUserOrders1(user_id));
            });
        });
        return response;
    }

    async getUserOrders1(user_id)
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const sql = "SELECT * FROM " + process.env.TABLE_ORDERS + " WHERE user_id = ? ORDER BY date_created DESC;";
                connection.query(sql, [user_id], (error, results) =>
                {
                    if (error)
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }
                    if (typeof results === 'undefined') 
                    {
                        reject("Orders are undefined.");
                    }
                    // console.log("/getUserOrders1");
                    // console.log(results);

                    var userOrders = [];
                    for (let i = 0; i < results.length; i++)
                    {
                        var order = 
                        {
                            status           : results[i].status,
                            order_id         : results[i].order_id,
                            name             : results[i].name,
                            status           : results[i].status,
                            cart             : results[i].cart,
                            total            : results[i].total,
                            date_created     : results[i].date_created,
                            pickup_scheduled : results[i].pickup_scheduled,
                            pickup_location  : results[i].pickup_location
                        };

                        console.log('order');
                        console.log(order);
                        userOrders.push(order);
                    }

                    // console.log('userOrders');
                    // console.log(userOrders);
                    resolve(userOrders);
                })
            }
            catch (error)
            {
                console.log(error);
                reject();
            }
        });
        return response;
    }

    async adminUpdateOrderStatus(orderId, status_id, status, userEmail)
    {
        const response = new Promise((resolve, reject) =>
        {
            // console.log(order_id);
            const db = DbService.getDbServiceInstance();

            const query = "UPDATE " + process.env.TABLE_ORDERS + " SET status_id = ?, status = ? WHERE order_id = ?;";
            connection.query(query, [status_id, status, orderId], (err, result) =>
            {
                if (err)
                {
                    reject(err.message);
                }
                else
                {
                    console.log(`Order ${orderId} : Statis is now ${status}!`);
                    var subject = `Order ${orderId}, Status: ${status}`;
                    var html = 
                    `
                    <h3>Your Order Status has been updated to ${status}</h3>
                    <p>
                    Visit <a href="https://www.astromedibles.com/orders">this link</a> to see your order status.
                    <br>
                    This is an automated message.
                    </p>
                    `;


                    if (status === 'Payment Required')
                    {
                        console.log('Status Case: 1');

                        
                    } else if (status === 'Preparing Order')
                    {
                        console.log('Status Case: 2');
                        html = 
                        `
                        <h3>Your Order Status has been updated to ${status}</h3>
                        <p>
                        This means that we have confirmed your payment, and your order is being prepared.
                        <br>
                        You will recieve a notification once your order status has been updated to 'Ready for Pickup'.
                        <br>
                        When your order is Ready for Pickup, you will be able to select your scheduled pick up day & time. Along with directions and an address.
                        <br>
                        <br>
                        Visit <a href="https://www.astromedibles.com/orders">www.astromedibles.com/orders</a> to see your order status.
                        <br>
                        <br>
                        This is an automated message.
                        </p>
                        `;
                    } else if (status === 'Ready for Pickup')
                    {
                        console.log('Status Case: 3');

                        html = 
                        `
                        <h3>Step 1: Select Pickup Day & Time</h3>
                        <p>
                        First, confirm your pickup time at <a href="https://www.astromedibles.com/orders">www.astromedibles.com/orders</a>.
                        <br>
                        After you have selected your confirmed pickup time, follow these directions for pickup.
                        </p>
                        <br>
                        <h3>Step 2: Pickup At Location</h3>
                        <p>
                        <b>Directions For Pickup 77598:</b>
                        <br>
                        <a href="https://goo.gl/maps/jQcvTGmZJdWFp3q16">18833 Town Ridge Ln, Webster, TX 77598</a>
                        <br>
                        Do not enter the apartment complex. Please park on the side on the street, closer to Retail Rd. Park on any side of the street.
                        <br>
                        Let me know you have arrived.
                        <br>
                        <br>
                        <b>Alternative Location Pickup Directions 77504 (Lazy Daze):</b>
                        <br>
                        <a href="https://goo.gl/maps/yG57sXc9Mt3jaQMr8">4416 Fairmont Pkwy Ste 103, Pasadena, TX 77504</a>
                        <br>
                        To request to pick up at 77504, please let me know at least a day before so I can take your order over to Lazy Daze, and give you directions.
                        <br>
                        <br>
                        Message me here: <a href="https://twitter.com/AMedibles">AstroMedibles Twitter</a>
                        <br>
                        <br>
                        Visit <a href="https://www.astromedibles.com/orders">www.astromedibles.com/orders</a> to see your order status.
                        <br>
                        <br>
                        This is an automated message.
                        </p>
                        `;


                    } else if (status === 'Complete')
                    {
                        console.log('Status Case: 4');
                        html = 
                        `
                        <p>
                        We confirmed you have picked up your order, and we hope you enjoy! 🚀
                        <br>
                        <b>Thank you for choosing AstroMedibles! 👩‍🚀</b>
                        <br>
                        <br>
                        If you have any concerns, you can ask us at our <a href="https://www.astromedibles.com/help">Help Desk</a>.
                        <br>
                        Or if you just wanted to give some feedback, you can do that at our <a href="https://www.astromedibles.com/feedback">Send Feedback</a> page. 👩
                        <br>
                        <br>
                        This is an automated message.
                        </p>
                        `;
                    }
                    db.sendEmail(userEmail, subject, html);

                    resolve(result.affectedRows);
                }
            })
        });
        return response;
    }

    async cancelOrder(order_id, email, password)
    {
        const db = DbService.getDbServiceInstance();

        
        db.getUserData(email, password).then((dataResult) =>
        {
            dataResult = dataResult;
            var userId    = dataResult.id
            var userEmail = dataResult.email;
            var userName = dataResult.name;

            const response = new Promise((resolve, reject) =>
            {
                var status = "Payment Required";
                // console.log(order_id);
                // console.log(email);
                // console.log(status);
        
                const query = "DELETE FROM " + process.env.TABLE_ORDERS + " WHERE (user_id = ?) AND (order_id = ?) AND (status = ?);";
                connection.query(query, [userId, order_id, status], (err, result1) =>
                {
                    if (err)
                    {
                        reject(err.message);
                    }
                    else
                    {

                        const query2 = "UPDATE " + process.env.TABLE_NAMES + " SET date_lastOrderPlaced = ? WHERE id = ?;";
                        const lastOrderPlaced = '';
                        connection.query(query2, [lastOrderPlaced, userId], (err, result2) =>
                        {
                            if (err) 
                            {
                                reject(err);
                            }
                            else
                            {
                                console.log(`Order ${order_id} for ${userName} has been canceled!`);
                                var subject = "Your order has been canceled";
                                var html = 
                                `
                                <h3>No need to worry. Order id: ${order_id} has been canceled. </h3>
                                <p>
                                Start your new order at <a href="${address}">AstroMedibles.com</a>.
                                <br>
                                This is an automated message.
                                </p>
                                `;
                                
                                db.sendEmail(userEmail, subject, html);

                                resolve([result1.affectedRows, result2.affectedRows]);
                            }
                        });
                    }
                })
            });
            return response;
        });
    }
    
    async adminGetUserOrders()
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const sql = "SELECT * FROM " + process.env.TABLE_ORDERS + " ORDER BY status_id ASC, date_created DESC;";
                connection.query(sql, [], (error, results) =>
                {
                    if (error)
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }
                    if (typeof results === 'undefined') 
                    {
                        reject(".TABLE_ORDERS results are undefined.");
                    }

                    var userOrders = [];
                    for (let i = 0; i < results.length; i++)
                    {
                        var order = 
                        {
                            status_id        : results[i].status_id,
                            status           : results[i].status,
                            order_id         : results[i].order_id,
                            name             : results[i].name,
                            email            : results[i].email,
                            status           : results[i].status,
                            cart             : results[i].cart,
                            total            : results[i].total,
                            date_created     : results[i].date_created,
                            pickup_scheduled : results[i].pickup_scheduled
                        };

                        // console.log('order');
                        // console.log(order);
                        userOrders.push(order);
                    }

                    resolve(userOrders);
                })
            }
            catch (error)
            {
                console.log(error);
                reject();
            }});
        return response;
    }

    async adminGetAccessCodes()
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const sql = "SELECT * FROM " + process.env.TABLE_CODES + ";";
                connection.query(sql, [], (error, results) =>
                {
                    if (error)
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }
                    if (typeof results === 'undefined') 
                    {
                        reject("Access Codes are undefined.");
                    }

                    var accessCodesText = "";
                    for (let i = 0; i < results.length; i++)
                    {
                        accessCodesText += results[i].code + "\n";
                        // console.log(results[i].code);
                    }
                    resolve(accessCodesText);
                })
            }
            catch (error)
            {
                console.log(error);
                reject();
            }});
        return response;
    }

    async adminGetUserPickups()
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const sql = "SELECT * FROM " + process.env.TABLE_ORDERS + " WHERE status = 'Ready for Pickup' ORDER BY pickup_scheduled ASC, name ASC;";
                connection.query(sql, [], (error, results) =>
                {
                    if (error)
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }
                    if (typeof results === 'undefined') 
                    {
                        reject("Orders are undefined.");
                    }

                    var pickups = [];
                    for (var i = 0; i < results.length; i++)
                    {
                        try 
                        { 
                            console.log(results[i]);
                            if (results[i].pickup_scheduled.length > 2)
                            {
                                var pickupDate = new Date(results[i].pickup_scheduled);
                                var pickupElement = 
                                {
                                    id:              results[i].id,
                                    date:            pickupDate,
                                    pickup_location: results[i].pickup_location,
                                    order_id:        results[i].order_id,
                                    name:            results[i].name
                                };
                                pickups.push(pickupElement);
                            }
                        } 
                        catch (error)
                        { 
                            // skip no pickup_scheduled order
                        }
                    }

                    console.log('pickups');
                    console.log(pickups);
                    resolve(pickups);
                })
            }
            catch (error)
            {
                console.log(error);
                reject();
            }});
        return response;
    }

    async getPickupAvailabilityDays()
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const sql = "SELECT * FROM " + process.env.TABLE_PICKUPS_DAYS + ";";
                connection.query(sql, [], (error, results) =>
                {
                    if (error)
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }
                    if (typeof results === 'undefined') 
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }

                    var days = [];
                    for (let i = 0; i < results.length; i++)
                    {
                        days.push(results[i].available);
                    }
                    resolve(days);
                });
            }
            catch (error)
            {
                reject(error);
            }});
        return response;
    }

    async getPickupAvailabilityTimes()
    {
        const response = await new Promise((resolve, reject) => 
        {

            const sql = "SELECT * FROM " + process.env.TABLE_PICKUPS_TIMES + ";";
            connection.query(sql, [], (error, results) =>
            {
                try
                {
                    if (error)
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                        return;
                    }
                    
                    var times = [];
                    for (let i = 0; i < results.length; i++)
                    {
                        times.push(results[i].available);
                    }
                    resolve(times);
                }
                catch (error)
                {
                    reject(error);
                }
            });
        });
        return response;
    }

    /* 
        params * recieves date from customer
        returns days and times customer can select for order pickup
    */
    async ordersCustomerGetPickupDaysAndTimes(customerDate)
    {
        console.log("/ordersCustomerGetPickupDaysAndTimes(customerDate)");
        customerDate = new Date(customerDate);

        // TIMEZONE OFFSET, NEW YORK SERVER

        console.log('customerDate: ' + customerDate.toISOString());
        var avalibleDaysandTimes = [];
        /* avalibleDaysandTimes = ...
        * [ 
        *   day 1 [ [YYYY-MM-DD T Hh:Min:Sec.00Z, AvalibleYesOrNo], ... ],
        *   day 2 [ [YYYY-MM-DD T Hh:Min:Sec.00Z, AvalibleYesOrNo], ... ],
        *   day 3 [ [YYYY-MM-DD T Hh:Min:Sec.00Z, AvalibleYesOrNo], ... ]
        * ]

        */
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const query1 = "SELECT * FROM " + process.env.TABLE_PICKUPS_DAYS + ";";
                const query2 = "SELECT * FROM " + process.env.TABLE_PICKUPS_TIMES + ";";
                connection.query(query1 + query2, [], (err, results) =>
                {
                    if (err)
                    {
                        reject(new Error("/ordersCustomerGetPickupDaysAndTimes(customerDate) ERROR\n" + err.message));
                        return;
                    }

                    var pickupDays        = results[0];
                    var pickupTimes       = results[1];


                    // 1. create possible days
                    var numberOfDays = 6;
                    for (var i = 0; i < numberOfDays; i++)
                    {
                        // create possible day
                        var suggestedDate = new Date(customerDate.getFullYear(), customerDate.getMonth(), customerDate.getDate() + i);

                        // if suggested day is not available on admin options, skip
                        if (pickupDays[suggestedDate.getDay()].available === 0)
                        {
                            continue;
                        }
                        // console.log('suggestedDate: ' + suggestedDate.toISOString());
                        // console.log('DATE GOOD')

                        var avalibleSubElement = [];

                        // now that day is good, add times to day
                        for (var j = 0; j < pickupTimes.length; j++)
                        {
                            // if suggested time is not available on admin options, skip
                            if (pickupTimes[j].available === 0)
                            {
                                continue;
                            }
    
                            suggestedDate.setHours(parseInt(pickupTimes[j].time));
                            // console.log()

                            var localeString = suggestedDate.toLocaleString("en-US", {timeZone: "America/Chicago"});
                            localeString = `${localeString.substring(localeString.indexOf(' ') + 1).replace('00:00', '00')}`;
                            // console.log(`suggestedTime: ${localeString}`);
                            var AvalibleYesOrNo = true;

                            // console.log('suggestedDate + time: ' + suggestedDate.toISOString());
                            // console.log('localeString: ' + localeString);
                            
                            avalibleSubElement.push([localeString, AvalibleYesOrNo, suggestedDate.toISOString()]);
                        }
                        avalibleDaysandTimes.push(avalibleSubElement); 
                        // console.log('avalibleSubElement');
                        // console.log(avalibleSubElement);
    
                    }


                    // check all pickup scheduled times sorted by descending
                    const query = "SELECT * FROM " + process.env.TABLE_ORDERS + " WHERE status = 'Ready for Pickup' ORDER BY pickup_scheduled DESC;";
                    // console.log(`connection.query( ${date.toISOString()} )`);
                    // console.log('Checking Scheduled Date of ' + date.toISOString());
                    connection.query(query, [], (error2, results2) =>
                    {
                        if (error2)
                        {
                            console.log(error2.message);
                        }
                        else
                        {

                            // console.log( date.toISOString() + '  Scheduled so far: ' + results2.length);
                            // console.log('process.env.TABLE_PICKUPS_LIMIT: ' + process.env.TABLE_PICKUPS_LIMIT);

                            var lastDate = '';
                            var counter = 0;
                            var overCapacityDates = [];
                            var skipDate = '';
                            for (var i = 0; i < results2.length; i++)
                            {
                                try
                                {
                                    var newDate = new Date(results2[i].pickup_scheduled);

                                    // if pickup date is in the past, skip. Or if date equals an already marked overcapacity date, skip.
                                    if (Date.parse(newDate) - Date.parse(customerDate) < 0 || newDate.toISOString() == skipDate)
                                    {
                                        // console.log('DATE HAS PASSED');
                                    }
                                    // date is in the future
                                    else
                                    {
                                        // console.log('DATE NOT PASSED');
                                        // if pickup date has hit capacity, add it to the overCapacity list
                                        if (newDate.toISOString() == lastDate)
                                        {
                                            counter += 1;
                                            if (counter == process.env.TABLE_PICKUPS_LIMIT)
                                            {
                                                overCapacityDates.push(newDate.toISOString());
                                                skipDate = newDate.toISOString();
                                            }
                                        }
                                        else
                                        {
                                            counter = 0;
                                        }
                                        lastDate = newDate.toISOString();
                                    }
                                }
                                catch (error3)
                                {
                                    // console.log(error3);
                                }
                            }
                        }

                        console.log('overCapacityDates:');
                        console.log(overCapacityDates);

                        // console.log('\n avalibleDaysandTimes: BEFORE REMOVAL');
                        // console.log(avalibleDaysandTimes);

                        // Set AvalibleYesOrNo to false on times at over capacity
                        for (var i = 0; i < avalibleDaysandTimes.length; i++)
                        {
                            var element1 = new Date(avalibleDaysandTimes[i][0][2]);
                            for (var j = 0; j < overCapacityDates.length; j++)
                            {
                                var element2 = new Date(overCapacityDates[j]);

                                // console.log('\nelement1:');
                                // console.log(element1.toISOString());

                                // console.log('element2:');
                                // console.log(element2.toISOString());

                                var isSameDay =   (element1.getDate()     === element2.getDate() 
                                                && element1.getMonth()    === element2.getMonth()
                                                && element1.getFullYear() === element2.getFullYear());

                                if (isSameDay)
                                {
                                    // console.log('isSameDay TRUE!');
                                    for (var k = 0; k < avalibleDaysandTimes[i].length; k++)
                                    {
                                        var element3 = avalibleDaysandTimes[i][k]; // [locale string, AvalibleYesOrNo, date]
                                        var element3Date = new Date(element3[2]);

                                        var isSameTime = (element3Date.getHours() === element2.getHours());

                                        if (isSameTime)
                                        {
                                            // console.log('isSameTime TRUE!');
                                            element3[1] = false; // set AvalibleYesOrNo to false
                                        }
                                    }
                                }
                            }
                        }

                        // console.log(results[0]); // [{1: 1}]
                        // console.log(results[1]); // [{2: 2}]
                        // console.log(results[2]); // [{2: 2}]

                        console.log('\n avalibleDaysandTimes: AFTER REMOVAL');
                        console.log(avalibleDaysandTimes);

                        resolve([avalibleDaysandTimes]);

                    });
                });

            } catch (error)
            {
                console.log(error);
                reject(error);
            }
        });
        return response;
    }

    async userUpdateScheduledPickup(orderId, dateScheduledPickup, pickupLocation)
    {
        const response = new Promise((resolve, reject) =>
        {
            const db = DbService.getDbServiceInstance();

            // If time slot is full, reject
            const query1 = "SELECT * FROM " + process.env.TABLE_ORDERS + " WHERE pickup_scheduled = ?; ";
            
            // query
            connection.query(query1, [dateScheduledPickup], (error1, result1) =>
            {
                if (error1)
                {
                    reject(error1.message);
                }
                else
                {
                    console.log(`result1.length: ${result1.length}`);
                    if (result1.length >= parseInt(process.env.TABLE_PICKUPS_LIMIT))
                    {
                        console.log('Time Slot FULL, rejected');
                        reject('Time Slot Limit');

                    }
                    else
                    {
                        console.log('Time Slot avalible, accepted');
                        console.table([dateScheduledPickup, pickupLocation, orderId]);

                        // update timeslot with new order
                        const query2 = "UPDATE " + process.env.TABLE_ORDERS + " SET pickup_scheduled = ?, pickup_location = ? WHERE order_id = ?;";
                        connection.query(query2, [dateScheduledPickup, pickupLocation, orderId], (error2, result2) =>
                        {
                            if (error2)
                            {
                                reject(error2.message);
                            }
                            else
                            {
                                console.log(`Order ${orderId} : dateScheduledPickup (${dateScheduledPickup}) has been updated!`);
                                // var subject = `Order ${orderId}, sta dateScheduledPickup: ${dateScheduledPickup}`;
                                // var html = 
                                // `
                                // <h3>Order ID: ${orderId} dateScheduledPickup: ${dateScheduledPickup}</h3>
                                // <p>
                                // Order id: ${orderId} dateScheduledPickup has been updated!
                                // <br>
                                // This is an automated message.
                                // </p>
                                // `;
                                // db.sendEmail(userEmail, subject, html);
                                resolve(result2.affectedRows);
                            }
                        });
                    }
                }
            });
        });
        return response;
    }

    async adminSetPickupsDays(available)
    {
        const response = new Promise((resolve, reject) =>
        {
            try
            {
                console.log('available:');
                console.log(available);

                const query1 = "UPDATE " + process.env.TABLE_PICKUPS_DAYS  + " SET `available` = ? WHERE (`id` = '1');";
                const query2 = "UPDATE " + process.env.TABLE_PICKUPS_DAYS  + " SET `available` = ? WHERE (`id` = '2');";
                const query3 = "UPDATE " + process.env.TABLE_PICKUPS_DAYS  + " SET `available` = ? WHERE (`id` = '3');";
                const query4 = "UPDATE " + process.env.TABLE_PICKUPS_DAYS  + " SET `available` = ? WHERE (`id` = '4');";
                const query5 = "UPDATE " + process.env.TABLE_PICKUPS_DAYS  + " SET `available` = ? WHERE (`id` = '5');";
                const query6 = "UPDATE " + process.env.TABLE_PICKUPS_DAYS  + " SET `available` = ? WHERE (`id` = '6');";
                const query7 = "UPDATE " + process.env.TABLE_PICKUPS_DAYS  + " SET `available` = ? WHERE (`id` = '7');";
    
                var query = query1 + query2 + query3 + query4 + query5 + query6 + query7;
    
                connection.query(query, [available[0], available[1], available[2], available[3], available[4], available[5], available[6]], (err, results) =>
                {
                    if (err)
                    {
                        reject(err.message);
                    }
                    else
                    {
                        // console.log(results[0]); // [{1: 1}]
                        // console.log(results[1]); // [{2: 2}]
                        console.log("\n");
                        console.log("results.affectedRows:");
                        console.log(results[0].affectedRows);
                        console.log('New Schedule DAYS Update Complete');

                        resolve(results.affectedRows);
                    }
                });
            }
            catch (error)
            {
                reject('ERROR adminSetPickupsDays(avalible) \n' + error);
            }
        });
        return response;
    }

    async adminSetPickupsTimes(available)
    {
        const response = new Promise((resolve, reject) =>
        {
            try
            {
                console.log('available:');
                console.log(available);

                const query1  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '1');";
                const query2  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '2');";
                const query3  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '3');";
                const query4  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '4');";
                const query5  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '5');";
                const query6  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '6');";
                
                const query7  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '7');";
                const query8  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '8');";
                const query9  = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '9');";
                const query10 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '10');";
                const query11 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '11');";
                const query12 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '12');";

                const query13 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '13');";
                const query14 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '14');";
                const query15 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '15');";
                const query16 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '16');";
                const query17 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '17');";
                const query18 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '18');";

                const query19 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '19');";
                const query20 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '20');";
                const query21 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '21');";
                const query22 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '22');";
                const query23 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '23');";
                const query24 = "UPDATE " + process.env.TABLE_PICKUPS_TIMES  + " SET `available` = ? WHERE (`id` = '24');";


                var query =
                query1  + query2  + query3  + query4  + query5  + query6  +
                query7  + query8  + query9  + query10 + query11 + query12 +
                query13 + query14 + query15 + query16 + query17 + query18 +
                query19 + query20 + query21 + query22 + query23 + query24;
    
                connection.query(query, [available[0], available[1], available[2], available[3], available[4], available[5], available[6], available[7], available[8], available[9], available[10], available[11], available[12], available[13], available[14], available[15], available[16], available[17], available[18], available[19], available[20], available[21], available[22], available[23]], (err, results) =>
                {
                    if (err)
                    {
                        reject(err.message);
                    }
                    else
                    {
                        // console.log(results[0]); // [{1: 1}]
                        // console.log(results[1]); // [{2: 2}]
                        console.log("\n");
                        console.log("results.affectedRows:");
                        console.log(results[0].affectedRows);
                        console.log('New Schedule TIMES Update Complete');

                        resolve(results.affectedRows);
                    }
                });
            }
            catch (error)
            {
                reject('ERROR adminSetPickupsTimes(avalible) \n' + error);
            }
        });
        return response;
    }


    async forgotPasswordGenerateCode(email)
    {
        const response = new Promise((resolve, reject) =>
        {
            email = email.toLowerCase();
            const verificationCode  = Math.random().toString(36).substr(2,10); // Random 10 char alphanumeric
            const query = "UPDATE " + process.env.TABLE_NAMES + " SET verificationCode = ? WHERE email = ?";
            connection.query(query, [verificationCode, email], (err, result) =>
            {
                if (err)
                {
                    reject(err.message);
                    return;
                }
                else
                {
                    if (result.affectedRows <= 0)
                    {
                        var error = 'forgotPasswordGenerateCode(email) ERROR: Email could not be found.';
                        reject(error);
                        return;
                    }

                    console.log(`ForgotPasswordGenerateCode Email: ${email} : ${verificationCode} verification code sent!`);
                    var subject = 'Forgot your Password';
                    var html = 
                    `
                    <h3>Verifcation Code: <b>${verificationCode}</b></h3>
                    <p>
                    Please enter this code to create your new password.
                    <br>
                    This is an automated message.
                    </p>
                    `;
                    
                    const db = DbService.getDbServiceInstance();
                    db.sendEmail(email, subject, html);

                    resolve(result.affectedRows);
                }
            });
        });
        return response;
    }

    async updateAccountAttributes(currentEmail, newEmail, password, name)
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                currentEmail = currentEmail.toLowerCase();
                newEmail = newEmail.toLowerCase();

                const query = "SELECT * FROM " + process.env.TABLE_NAMES + " WHERE email = ?";
                connection.query(query, [currentEmail, password], (err, results) =>
                {
                    if (err) 
                    {
                        reject(new Error("dbService.js updateAccountAttributes(currentEmail, newEmail, password, name) ERROR\n" + err.message));
                    }

                    if (results.length > 0)
                    {
                        var decryptedText = CryptoJS.AES.decrypt(results[0].password, process.env.KEY).toString(CryptoJS.enc.Utf8);

                        // console.log('OriginalText: ' + password);
                        // console.log('decryptedText: ' + decryptedText);

                        if (password == decryptedText)
                        {
                            // console.log('Login success!');
                            // console.log("results[0]");
                            // console.log(results[0]);
                            const id = results[0].id;

                            // console.log(id);
                            // console.log(name);
                            // console.log(newEmail);
                            const query = "UPDATE " + process.env.TABLE_NAMES + " SET name = ?, email = ? WHERE id = ?;";
                            connection.query(query, [name, newEmail, id], (err, results2) =>
                            {
                                if (err) 
                                {
                                    reject(new Error("dbService.js getUserData(email, password) ERROR\n" + err.message));
                                }

                                resolve(results2.affectedRows);
                                console.log(`UpdateAccountAttributes Email: ${newEmail} : Name: ${name} user account update sent!`);
                                var subject = 'Updated Account Information';
                                var html = 
                                `
                                <h3>Your account information has been updated at astromedibles.com</b></h3>
                                <p>
                                This is an automated message.
                                </p>
                                `;
                                
                                const db = DbService.getDbServiceInstance();
                                db.sendEmail(newEmail, subject, html);
                                console.log('Account Update Success!');
                                return;
                            });
                        }
                        else
                        {
                            reject('Wrong password');
                            return;
                        }
                    }
                    else
                    {
                        reject('Wrong email.');
                        return;
                    }
                });
            }
            catch (error)
            {
                console.log(error);
                reject(error);
            }
        });
        return response;
    }

    async updatePassword(email, password, verificationCode)
    {
        const response = new Promise((resolve, reject) =>
        {
            email = email.toLowerCase();
            var encryptedText = CryptoJS.AES.encrypt(password, process.env.KEY).toString();

            const query = "UPDATE " + process.env.TABLE_NAMES + " SET password = ? WHERE email = ? AND verificationCode = ?;";
            connection.query(query, [encryptedText, email, verificationCode], (err, result) =>
            {
                if (err)
                {
                    reject(err.message);
                }
                else if (result.affectedRows == 0)
                {
                    reject("Verification Code \nNo record match found");
                }
                else
                {
                    console.log(result);
                    console.log(`updatePassword Email: ${email} : ${verificationCode} Password updated!`);
                    var subject = 'Your password has been updated';
                    var html = 
                    `
                    <p>
                        Your password has been updated at AstroMedibles.
                    <br>
                    This is an automated message.
                    </p>
                    `;
                    const db = DbService.getDbServiceInstance();
                    db.sendEmail(email, subject, html);
                    resolve(result.affectedRows);
                }
            })
        });
        return response;
    }

    async customerSupportEmailFeedback(userEmail, subject, description)
    {
        const response = new Promise((resolve, reject) =>
        {
            try
            {
                // send to both astromedibles@gmail, and user email
                var toEmail = `${process.env.AM_USER}, ${userEmail}`;

                subject = `[Feedback] ${subject}`;
                var html = 
                `
                <h3>Feedback Response:</h3>
                <p>
                    "${description}"
                <br>
                This is an automated message.
                </p>
                `;
                
                // Send email
                const db = DbService.getDbServiceInstance();
                db.sendEmail(toEmail, subject, html);
                resolve(true);

            } catch (error)
            {
                reject(error);
            }
        });
        return response;
    }

    async customerSupportEmailHelpDesk(userEmail, orderId, description)
    {
        const response = new Promise((resolve, reject) =>
        {
            try
            {
                // send to both astromedibles@gmail, and user email
                var toEmail = `${process.env.AM_USER}, ${userEmail}`;

                var subject = `[Help Desk] Order: ${orderId}`;
                var html = 
                `
                <h3>Help Desk Response:</h3>
                <p>
                    "${description}"
                <br>
                This is an automated message.
                </p>
                `;
                
                // Send email
                const db = DbService.getDbServiceInstance();
                db.sendEmail(toEmail, subject, html);
                resolve(true);

            } catch (error)
            {
                reject(error);
            }
        });
        return response;
    }

    async sendEmail(toEmail, subject, html)
    {
        var transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth:
            {
                user: process.env.AM_USER,
                pass: process.env.AM_PASSWORD
            }
        });
        
        var mailOptions =
        {
            from:    process.env.AM_USER,
            to:      toEmail,
            subject: subject,
            html:    html
        };
        
        transporter.sendMail(mailOptions, function (error, info)
        {
            if (error)
            {
                console.log(error);
            } else
            {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}

module.exports = DbService;