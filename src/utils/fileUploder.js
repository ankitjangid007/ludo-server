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
    // Ensure that you POST a base64 data to your server.
    // Let's assume the variable "base64" is one.
    const base64Data = new Buffer.from(fileData.replace(/^data:image\/\w+;base64,/, ""), 'base64');

    // Getting the file type, ie: jpeg, png or gif
    const type = fileData.split(';')[0].split('/')[1];

    // With this setup, each time your user uploads an image, will be overwritten.
    // To prevent this, use a different Key each time.
    // This won't be needed if they're uploading their avatar, hence the filename, userAvatar.js.
    const timeStamp = new Date().getTime();

    const params = {
        Bucket: "battleresultimages",
        Key: `${timeStamp}.${type}`, // type is not required
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64', // required
        ContentType: `image/${type}` // required. Notice the back ticks
    }


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