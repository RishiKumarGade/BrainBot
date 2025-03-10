

import { connect } from "@/dbConfig/dbConfig";
import checkSessionExistenceServerSide from "@/helpers/checkSessionExistenceServerSide";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { getTokensToken } from "@/helpers/getTokensToken";
import Login from "@/models/loginModel";
import Game from "@/models/gameModel";
import Challenge from "@/models/challengeModel";

import { NextRequest, NextResponse } from "next/server";

connect()

export async function GET(request:NextRequest) {
    try {
        const userId = await getDataFromToken(request)
        const reqBody = await request.json()
        const {gametype,game,opponentId} = reqBody
        const newChallenge = await Challenge.create({ gametype:gametype,game:game,opponentId:opponentId,userId:userId})
            return NextResponse.json({message:'challenge sent',success:true})  
        } catch (error:any) {
            return NextResponse.json({error: error.message })
        }
}
