import { prisma } from "@constants/db";

export const createAsset = async (data) => {
  try {
    const event = await prisma.assets.create({
      data: data,
    });

    if (event) {
      return { status: true, error: null, msg: "Success!" };
    } else {
      return {
        status: false,
        error: "Failed to create asset in database",
        msg: "",
      };
    }
  } catch (error) {
    console.log(error);
    return { status: false, error: error, msg: null };
  }
};

