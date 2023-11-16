export const resultFilter = async (rawData) => {
    const resultArray = [];
    for (let i = 0; i < rawData.length; i++) {
        const { documents } = rawData[i];


        if (documents.length === 2) {
            const battleResultFirst = documents[0].battleResult;

            const battleResultSecond = documents[1].battleResult;

            if (battleResultFirst === "Cancel" && battleResultSecond === "Cancel") {
                // Filter the cancel results
            } else if ((battleResultFirst === "I won" || battleResultFirst === "I lost") && (battleResultSecond === "I won" || battleResultSecond === "I lost") && (battleResultFirst !== battleResultSecond)) {
                // Filter the won results 
            } else {


                resultArray.push({
                    battleId: documents[0].battleId,
                    roomCode: documents[0].roomCode,
                    users: [
                        {
                            userId: documents[0].user._id,
                            userName: documents[0].user.userName,
                            mobileNumber: documents[0].user.mobileNumber,
                            battleResult: documents[0].battleResult,
                            file: battleResultFirst === "I won" && documents[0].file ? documents[0].file : null,
                            cancellationReason: battleResultFirst === "Cancel" ? documents[0].cancellationReason : null,
                            createdAt: documents[0].createdAt,
                            updatedAt: documents[0].updatedAt
                        },
                        {
                            userId: documents[1].user._id,
                            userName: documents[1].user.userName,
                            mobileNumber: documents[1].user.mobileNumber,
                            battleResult: documents[1].battleResult,
                            file: battleResultSecond === "I won" && documents[1].file ? documents[1].file : null,
                            cancellationReason: battleResultSecond === "Cancel" ? documents[1].cancellationReason : null,
                            createdAt: documents[1].createdAt,
                            updatedAt: documents[1].updatedAt
                        }
                    ]
                })
            }
        } else {
            resultArray.push({
                battleId: documents[0].battleId,
                roomCode: documents[0].roomCode,
                users: [
                    {
                        userId: documents[0].user._id,
                        userName: documents[0].user.userName,
                        mobileNumber: documents[0].user.mobileNumber,
                        battleResult: documents[0].battleResult,
                        file: documents[0].battleResult === "I won" && documents[0].file ? documents[0].file : null,
                        cancellationReason: documents[0].battleResult === "Cancel" ? documents[0].cancellationReason : null,
                        createdAt: documents[0].createdAt,
                        updatedAt: documents[0].updatedAt
                    }]
            })
        }

    }
    return resultArray
}