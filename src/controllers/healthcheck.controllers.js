import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    try {
      return res
        .status(200)
        .json(new ApiResponse(200, { status: "OK" }, "Service is running smoothly"));
    } catch (error) {
      throw new ApiError(500, "Healthcheck failed. Something went wrong.")
    }
})

export {
    healthcheck
    }
    