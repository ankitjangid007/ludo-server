import PlayRequest from "../../models/temp/playRequest.model.js";

export const playRequestService = async (data) => {
  try {
    const requestData = new PlayRequest(data);
    await requestData.save();
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

export const getPlayRequestService = async (battleId) => {
  try {
    const data = await PlayRequest.findOne({ battleId });
    return data;
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};

export const deletePlayRequest = async (battleId) => {
  try {
    return await PlayRequest.findOneAndDelete({ battleId });
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
};
