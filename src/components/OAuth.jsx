import googleIcon from '../assets/svg/googleIcon.svg'
import {useLocation, useNavigate} from 'react-router-dom'
import {getAuth, signInWithPopup, GoogleAuthProvider} from 'firebase/auth'
import {db} from '../firebase.config'
import {doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore'
import {toast} from 'react-toastify'

function OAuth() {
    const navigate = useNavigate()
    const location = useLocation()

    const onGoogleClick = async()=>{
        try{
            const auth = getAuth()
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            const user = result.user

            // check for user
            const docref = doc(db, 'users', user.uid)
            const docSnap = await getDoc(docref)
            
            //If user dosent exist, create user
            if(!docSnap){
                await setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName,
                    email: user.email,
                    timestamp: serverTimestamp()
                })
            }
            navigate('/')
        }catch(error){
            toast.error('Could not authorize with google')
        }
    }
    
    return (
        <div className='socialLogin'>
            <p>sign {location.pathname === '/sign-In' ? 'In':'Up'} with</p>
            <button className="socialIconDiv" onClick={onGoogleClick}>
                <img src={googleIcon} alt="google" className='socialIconImg' />
            </button>
            
        </div>
    )
}

export default OAuth
