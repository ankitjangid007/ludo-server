import AWS from 'aws-sdk';

AWS.config.update({
    apiVersion: "2010-12-01",
    accessKeyId: "AKIA2TUSQJE2XOSACIZ6",
    secretAccessKey: "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",
    signatureVersion: 'v4',
    region: "ap-south-1"
});


const s3 = new AWS.S3();

// Function to upload image to S3
export async function uploadToS3(fileData) {
    console.log(process.env.AWS_ACCESS_KEY_ID)
    const [mimePart, base64Data] = fileData.split(";");
    const imageType = mimePart.split("/")[1];

    console.log(base64Data)
    // Decode Base64 data
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const timeStamp = new Date().getTime()
    const key = `battle.${imageType}`



    // Set up parameters for S3 upload
    const params = {
        Bucket: "battleresultimages",
        Key: key,
        Body: imageBuffer,
        ContentType: "image",
    };


    return new Promise((resolve, rejects) => {
        // Upload to S3
        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading to S3:', err);
                rejects(err)
            } else {
                console.log('Successfully uploaded to S3:', data.Location);
                resolve(data.Location)
            }
        });

    })




}