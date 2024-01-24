/* jab hum async await use krte h toh hume code ko try catch block me rakhna chaiye lekin, har function ko try catch me rakhne se hamare 
program ki length badh jaiye gi is se bachne k liye hum ye alag file bna de ge aur un async await function ko yha directly try catch 
me use kr le ge 1 hi try catch block likh k */

module.exports = theFunc =>(req,res,next)=>{
    Promise.resolve(theFunc(req,res,next)).catch(next)
}
