import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { db } from '../firebase.config'
import {doc, setDoc, serverTimestamp} from 'firebase/firestore'
import {ReactComponent as ArrowRightIcon} from '../assets/svg/keyboardArrowRightIcon.svg'
import OAuth from '../components/OAuth'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'
import { toast } from 'react-toastify'


function SignUp() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })

    const {name, email, password} = formData

    const navigate = useNavigate()

    const onChange = (e)=>{
        setFormData((prevState)=>{
            return {
                ...prevState,
                [e.target.id]:e.target.value
            }
        })
    }

    const onSubmit = async (e)=>{
        e.preventDefault()
        if(name==="" || password===""|| email===""){
            toast.error('Feilds cannot be empty')
            return
        }
        try{
            const auth =  getAuth()
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredentials.user

            updateProfile(auth.currentUser, {
                displayName: name
            })

            const formDataCopy = {...formData}
            delete formDataCopy.password

            formDataCopy.timestamp = serverTimestamp()

            await setDoc(doc(db, 'users', user.uid), formDataCopy)

            navigate('/')

        } catch(error){
            // const errorCode = error.code
            // const errorMessage = error.message
            toast.error('Something went wrong')
        }
    }

    return (
        <>
         <div className="pageContainer">
             <header>
                 <p className="pageHeader">
                     Create an account!
                 </p>
             </header>
             <form onSubmit={onSubmit}>
                <input type="text" placeholder='Name' 
                    id='name' className='nameInput' value={name} onChange={onChange}/>

                 <input type="text" placeholder='Email' 
                    id='email' className='emailInput' value={email} onChange={onChange}/>

                 <div className="passwordInputDiv">
                     <input type={showPassword ? 'text':'password'} className='passwordInput' 
                     id='password' value={password} onChange={onChange}/>
                     <img src={visibilityIcon} alt="show password" className='showPassword' 
                     onClick={()=>setShowPassword((prevState)=>!prevState)}/>
                 </div>
                 <Link to='/forgot-password' className='forgotPasswordLink'>Forgot Password</Link>
                
                <div className="signUpBar">
                    <p className="signUpText">Sign Up</p>
                    <button className='signUpButton'>
                    <ArrowRightIcon width={'36px'} height={'36px'} fill='#ffffff'/>
                    </button>
                </div>
             </form>

             <OAuth/>
             <Link to='/sign-In' className="registerLink">Sign In Instead</Link>
             </div>

        </>
    )
}

export default SignUp
