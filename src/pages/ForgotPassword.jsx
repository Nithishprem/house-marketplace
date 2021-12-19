import {useState} from 'react'
import {getAuth, sendPasswordResetEmail} from 'firebase/auth'
import {ReactComponent as ArrorRight} from '../assets/svg/keyboardArrowRightIcon.svg'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

function ForgotPassword() {
    const [email, setEmail] = useState('')

    const onChange = (e)=>{
        setEmail(e.target.value)
    }

    const onSubmit = async(e)=>{
        e.preventDefault()
        try{
            const auth =getAuth()
            await sendPasswordResetEmail(auth, email)
            toast.success('Email was sent')
        }catch(error){
            toast.error("could not send email")
        }
    }

    return (
        <div className='pageContainer'>
            <header className='pageHeader'>
                <p>Forgot Password</p>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <input type="email" placeholder='Email' id='email' 
                    className='emailInput' value={email} onChange={onChange} />

                    <Link className='forgotPasswordLink' to='/sign-in'>Sign In</Link>

                    <div className="signInBar">
                        <div className="signInText">Send Reset Link</div>
                        <button type='submit' className="signInButton"><ArrorRight fill='#ffffff' width='36px' height='36px' /></button>
                    </div>

                </form>
            </main>
            
        </div>
    )
}

export default ForgotPassword
