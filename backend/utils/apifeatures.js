// Isme hum mongodb ki properties use krege
/*
isme hum apni website m features add krege 
features = 1) Search 2) Filter 3) Pagination
*/


class ApiFeatures {
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr         
    }
    
    //features = 1) yadi hame koi special product search krna h jese ki shoes, t-shirt, chocolate, etc uska name use kr k.

    search(){
        const keyword = this.queryStr.keyword ? {
            name:{                              //name me us keyword ko find kre ga
                $regex: this.queryStr.keyword, //ye mongodb ki property h jo product ko keyword k basics pr find kregi
                $options:"i",   // keyword case sensitive nhi hoga. Dono(upper aur lower case) ke result show krega
            }
        }
        : {};    //yadi us keyword ka koi product nhi hoga toh empty return kr dega

        this.query = this.query.find({...keyword});      

        return this;        //is class ko return kr dega
    }

//hum apne product ko filter kr skte h catagories aur price k basics pr

    filter(){
        // ... ye spread operator h. Yadi ham bina ... k likhte toh hume refrence milta aur hum queryCopy me kuch change krte toh queryStr 
        // me bhi change hota isliye humne ... operator ka use kiya h jisse queryCopy me value aa gyi refrence ki jagah.
        const queryCopy = {...this.queryStr}

        //Filter for catagories -> Removing some fields for category
        const removeFields = ["keyword","page","limit"];

        removeFields.forEach(key=>delete queryCopy[key]);

        //filter for price -> hum range me filter krege price ko isliye hume ye alag bnana pdega catagories vale filter se

        //mongodb ka operation lagane k liye hum object ko string me convert kre ge JSON.stringify ki help se
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=>`$${key}`);

        //string ko vapas object me convert kr dege JSON.parse ki help se
        this.query = this.query.find(JSON.parse(queryStr));
        
        return this;

    }

    // Pagination -> yadi hume kisi specific page pr jaana h toh

    pagination(resultPerPage){
        //queryStr me hum jo page dege us pr le jaiye ga aur yadi humne koi page no nhi diya toh hum page no 1 pr chal jaiye ge
        const currentPage = Number(this.queryStr.page) || 1;
        
        // humara currentpage yadi 1 h to hum 0 product skip krdege, yadi 2 h toh hum 5*(2-1) = 5 product skip kr dege
        const skip = resultPerPage * (currentPage - 1)

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;
    }
}

module.exports = ApiFeatures