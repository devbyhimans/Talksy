import type { RequestHandler,Request,Response,NextFunction } from "express";

const TryCatch = (handler:RequestHandler):RequestHandler =>async(req:Request,res:Response,next:NextFunction) => {
    try {
        await handler(req,res,next);
    }
    catch(error:any) {
     res.status(500).json({success:false,message:error});
    }
}

export default TryCatch;