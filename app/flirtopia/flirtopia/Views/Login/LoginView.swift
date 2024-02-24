//
//  LoginView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import SwiftUI

struct LoginView: View {
    
    @StateObject private var vm = LoginViewModel()
    
    var body: some View {
        NavigationStack {
            VStack {
                LogoFlirtopia()
                LoginTextField(systemName: "person", placeholder: "Username", value: $vm.username)
                LoginSecureField(systemName: "lock", placeholder: "Password", value: $vm.password)
                LoginButton(vm: vm)
                LoginButtonSeparator()
                ButtonSignup()
                Spacer()
            }
            .navigationTitle("Login")
            .padding(15)
            .alert(vm.errorMessage, isPresented: $vm.showAlert) {}
        }
    }
}

#Preview {
    LoginView()
}
