const { send } = require('@sendgrid/mail');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (user)=>{
    const msg = {
        to : user.email,
        from : 'amithmichael3@gmail.com', 
        subject : 'Welcome to Task Manager Application',
        html : `
            <h1>Welcome to our app, ${ user.name }</h1>
            <p>You can manage all ur taks</p>
            <strong>You have created a account in task manager</strong>
        `
    }
    sgMail.send(msg);
}

const sendCancelationMain = (user)=>{
    const msg = {
        to : user.email,
        from : 'amithmichael3@gmail.com', 
        subject : 'Deleteing account from Task Manager Application',
        html : `
            <h1>Thank you for using our application, ${ user.name }</h1>
            <p>Sorry to see you go, Please provide feedback to improve ourself</p>
            <strong>See you soon</strong>
        `
    }
    sgMail.send(msg)
}


module.exports = {
    sendWelcomeMail,
    sendCancelationMain
};
