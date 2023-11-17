import AcceptRequest from "../../models/temp/acceptRequest.model.js";

export const acceptRequestService = async (data) => {
  try {
    const requestData = new AcceptRequest(data);
    await requestData.save();
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

export const getAcceptRequestService = async (battleId) => {
  try {
    const data = await AcceptRequest.findOne({ battleId });
    return data;
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

export const deleteAcceptRequest = async (battleId) => {
  try {
    return await AcceptRequest.findOneAndDelete({ battleId });
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};
