import {  getMe, googleOAuth, userLogin, userLogout, userRegistration } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";


export function useLogin(){

    return useMutation({
        mutationFn:userLogin
    })
}
export function useLogout(){

    return useMutation({
        mutationFn:userLogout
    })
}
export function useGetLoggedInUser(){

  return useQuery({
    queryKey:["user"],
    queryFn:getMe,
    retry:false

  })
}


export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}


export function useGoogleOAuth() {
  return useMutation({
    mutationFn: googleOAuth,
  });
}

