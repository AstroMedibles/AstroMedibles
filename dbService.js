const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2');
var nodemailer = require('nodemailer');

var instance = null;

const connection = mysql.createPool(
    {
        connectionLimit : 20, // <- Keep an eye on this
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        multipleStatements: false,
        port: process.env.DB_PORT
        // (Default: false) Allow multiple mysql statements per query.
        // Be careful with this, it exposes database to SQL injection attacks.
        // Connection Querys have been sanitized to prevent this.
    });

connection.on('acquire', function (connection)
{
    console.log('Connection %d acquired', connection.threadId);
});

connection.on('connection', function (connection)
{
    // connection.query('SET SESSION auto_increment_increment=1')
    console.log('Connection %d event', connection.threadId);
});

connection.on('enqueue', function ()
{
    console.log('connection enqueue');
    console.log('Waiting for available connection slot.');
});

connection.on('release', function (connection)
{
    console.log('Connection %d released', connection.threadId);
});

console.log("\n" + "Server Started:");
console.log(process.env.HOST);
console.log(process.env.USER);
console.log(process.env.PASSWORD);
console.log(process.env.DATABASE);
console.log(process.env.TABLE_ITEMS);
console.log(process.env.TABLE_NAMES);
console.log(process.env.TABLE_ORDERS);
console.log(process.env.PORT);
console.log(process.env.DB_PORT);
console.log("\n");

const address = 'https://astro-medibles-s8zwx.ondigitalocean.app';
// const address = 'http://localhost:8080';

// connection.connect((err) => 
// {
//     console.log("Attempting Connection:");
//     if (err)
//     {
//         console.log("Fail!");
//         console.log(err.message);
//         connection.end();
//     }
//     else
//     {
//         console.log("Success!");
//     }
// });



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
            })

        } catch (error)
        {
            console.log(error);
            reject();
        }
        });
        return response;
    }

    // returns BOOL loggedIn: true or false
    async getData(email, password)
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                email = email.toLowerCase();
                const query = "SELECT * FROM " + process.env.TABLE_NAMES + " WHERE email = ? AND password = ?;";
                connection.query(query, [email, password], (err, results) =>
                {
                    if (err) reject(new Error("dbService.js ERROR\n" + err.message));

                        var loggedIn = false;
                        if (results.length > 0)
                        {
                            console.log("loggedIn === true");
                            loggedIn = true;
                            // console.log("results: ");
                            // console.log(results);
                            // console.log(results[0]);
                            // console.log("results.length: ");
                            // console.log(results.length);
                            resolve(results);
                            return;
                        }
                        else
                        {
                            console.log("loggedIn === false");
                            loggedIn = false;
                            resolve(results);
                            return;
                        }
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

    async getUserData(email, password)
    {
        const response = await new Promise((resolve, reject) => 
        {
            try 
            {
                const query = "SELECT * FROM " + process.env.TABLE_NAMES + " WHERE email = ? AND password = ?;";
                connection.query(query, [email, password], (err, results) =>
                {
                    if (err) reject(new Error("dbService.js ERROR\n" + err.message));

                        if (results.length > 0)
                        {
                            console.log("loggedIn === true");
                            resolve(results[0]);
                        }
                        else
                        {
                            console.log("loggedIn === false");
                            reject(results);
                        }

                })
            }
            catch (error) 
            {
                console.log("getData() Error");
                console.log(error);
                reject(results);
            }
        });
        return response;
    }

    async getUserID(email, password)
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const sql = "SELECT id FROM " + process.env.TABLE_NAMES + " WHERE email = ? AND password = ?;";
                connection.query(sql, [email, password], (error, results) =>
                {
                    if (error) 
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }
                    if (typeof results[0] === 'undefined')
                    {
                        reject("Login failed, or cart is undefined.");
                    }
                    resolve(results[0].id);
                })
            }
            catch (error)
            {
                console.trace(error);
                reject(error);
            }});
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

    async getCartData(email, password)
    {
        const response = await new Promise((resolve, reject) => 
        {
            try
            {
                const sql = "SELECT cart FROM " + process.env.TABLE_NAMES + " WHERE email = ? AND password = ?;";
                connection.query(sql, [email, password], (error, results) =>
                {
                    if (error) 
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }
                    else
                    {
                        resolve(results);
                    }
                })
            }
            catch (error)
            {
                console.log(error);
                reject();
            }});
        return response;
    }

    // Return's user's cart after action
    async setCartData(email, password, cart)
    {
        const response = await new Promise((resolve, reject) =>
        {
                try
                {
                const query = "UPDATE " + process.env.TABLE_NAMES + " SET cart = ? WHERE email = ? AND password = ?;";
                connection.query(query, [cart, email, password], (err, result) =>
                {
                    if (err) reject(new Error(err.message));

                    result.affectedRows;     // Save SQL changes
                    cart = JSON.parse(cart); // Return user's cart as JSON object
                    resolve(cart);
                });
            } catch (error)
            {
                console.log(error);
                reject(false);
            }});
        return response;
    }

    // Return's user's cart after action
    async cartAddItem(email, password, itemId, itemQty)
    {
        const response = await new Promise((resolve, reject) => 
        {
            const db = DbService.getDbServiceInstance();
            // Grab user's cart from database with given email and password
            var cartResult = db.getCartData(email, password);
            cartResult.then(results => 
            {
                var cart = [[0, 0]];
                try
                {
                    // retrieve the user's cart
                    cart = results[0].cart.cart;
                }
                catch (error)
                {
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
            var cartResult = db.getCartData(email, password);
            cartResult.then(results => 
            {
                console.log("cartSubtractItem .then");
                var cart = [[0, 0]];
                try
                {
                    // retrieve the user's cart
                    cart = results[0].cart.cart;
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

    async generateAccountCreationCodes(quantity)
    {
        const response = await new Promise((resolve, reject) => 
        {
            console.log(`generateAccountCreationCodes(${quantity})`);
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
            console.log(`generateAccountCreationCodes(${code})`);

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
            // date_created.toLocaleString('en-US', { timeZone: 'America/New_York' });

            // console.log(userData);
            // console.log(user_id);
            // console.log(status);
            // console.log(order_id);
            // console.log(user_name);
            // console.log(userData.cart.cart);
            // console.log(total);
            // console.log(date_created);
            
            const insertId = new Promise((resolve, reject) =>
            {
                const query = "INSERT INTO " + process.env.TABLE_ORDERS + " (user_id, status, order_id, name, cart, total, date_created) VALUES (?,?,?,?,?,?,?);";
    
                connection.query(query, [user_id, status, order_id, user_name, cart, total, date_created], (err, result) =>
                {
                    if (err)
                    {
                        reject(new Error(err.message));
                    }
                    else
                    {
                        // clear user cart
                        db.cartRemoveAllItems(email, password);
                        resolve(result.insertId);
                    }
                })
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
            db.getUserData(email, password).then((dataResult) =>
            {
                var cart = dataResult.cart.cart;
                db.cartCalculateTotalCost(cart).then((usersCartTotalResult) =>
                {
                    resolve([dataResult, usersCartTotalResult]);
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
        var date_created = new Date();
        // date_created.toLocaleString('en-US', { timeZone: 'America/New_York' });

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

                        var query2 = "INSERT INTO " + process.env.TABLE_NAMES + " (isAdmin, name, password, cart, email, date_created, verificationCode) VALUES (?,?,?,?,?,?,?);";
                        connection.query(query2, [isAdmin, name, password, cart, email, date_created, accessCode], (err, result) =>
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
                                <h3>Time to earn points!</h3>
                                <p>
                                Head over to <a href="${address}">AstroMedibles.com</a> to start your order.<br>
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
            db.getUserID(email, password)
                .then(user_id => 
                {
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
                    if (results[0] === undefined) 
                    {
                        reject("Orders are undefined.");
                    }
                    // console.log("/getUserOrders1");
                    // console.log(results);

                    var userOrders = [];
                    for (let i = 0; i < results.length; i++)
                    {
                        var status       = { "status":       results[i].status };
                        var order_id     = { "order_id":     results[i].order_id };
                        var name         = { "name":         results[i].name };
                        var cart         = { "cart":         results[i].cart };
                        var total        = { "total":        results[i].total };
                        var date_created = { "date_created": results[i].date_created };
                        var order        = [status, order_id, name, cart, total, date_created];
                        userOrders.push(order);
                    }

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


    async adminUpdateOrderStatus(orderId, status)
    {
        const response = new Promise((resolve, reject) =>
        {
            // var status = "Payment Required";
            // console.log(order_id);
            // const db = DbService.getDbServiceInstance();

            const query = "UPDATE " + process.env.TABLE_ORDERS + " SET status = ? WHERE order_id = ?;";
            connection.query(query, [status, orderId], (err, result) =>
            {
                if (err)
                {
                    reject(err.message);
                }
                else
                {

                    console.log(`Order ${orderId} : ${status} has been updated!`);
                    var subject = `Order id: ${orderId} Status: ${status}`;
                    var html = 
                    `
                    <h3>Order id: ${orderId} Status: ${status}</h3>
                    <p>
                    Order id: ${orderId} status has been updated!
                    <br>
                    This is an automated message.
                    </p>
                    `;
                    
                    // db.sendEmail(userEmail, subject, html);

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
                connection.query(query, [userId, order_id, status], (err, result) =>
                {
                    if (err)
                    {
                        reject(err.message);
                    }
                    else
                    {

                        console.log(`Order ${order_id} for ${userName} has been deleted!`);
                        var subject = "Your order has been canceled";
                        var html = 
                        `
                        <h3>No need to worry. Order id: ${order_id} has been canceled. </h3>
                        <p>
                        Start your new order at <a href="${address}">AstroMedibles.com</a>.<br>
                        This is an automated message.
                        </p>
                        `;
                        
                        db.sendEmail(userEmail, subject, html);
    
                        resolve(result.affectedRows);
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
                const sql = "SELECT * FROM " + process.env.TABLE_ORDERS + " ORDER BY date_created DESC;";
                connection.query(sql, [], (error, results) =>
                {
                    if (error)
                    {
                        reject(new Error("dbService.js ERROR\n" + error));
                    }
                    if (results[0] === undefined) 
                    {
                        reject("Orders are undefined.");
                    }

                    var userOrders = [];
                    for (let i = 0; i < results.length; i++)
                    {
                        var status       = { "status":       results[i].status };
                        var order_id     = { "order_id":     results[i].order_id };
                        var name         = { "name":         results[i].name };
                        var cart         = { "cart":         results[i].cart };
                        var total        = { "total":        results[i].total };
                        var date_created = { "date_created": results[i].date_created };
                        var order        = [status, order_id, name, cart, total, date_created];
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
                    if (results[0] === undefined) 
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
                }
                else
                {
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
            })
        });
        return response;
    }

    async updatePassword(email, password, verificationCode)
    {
        const response = new Promise((resolve, reject) =>
        {
            email = email.toLowerCase();

            const query = "UPDATE " + process.env.TABLE_NAMES + " SET password = ? WHERE email = ? AND verificationCode = ?;";
            connection.query(query, [password, email, verificationCode], (err, result) =>
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
                to:      process.env.AM_USER + ', ' + process.env.AM_USER_DEV01 + ', ' + toEmail,
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