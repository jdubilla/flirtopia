//
//  SignupView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import SwiftUI

struct SignupView: View {
    
    @StateObject var vm = SignupViewModel()
    
    var body: some View {
        NavigationStack {
            VStack {
                LogoFlirtopia()
                SignupTextField(systemName: "person", placeholder: "Username", value: $vm.username, updateButtonState: vm.updateButtonState)
                SignupTextField(systemName: "person.fill", placeholder: "First name", value: $vm.firstName, updateButtonState: vm.updateButtonState)
                SignupTextField(systemName: "person.fill", placeholder: "Last name", value: $vm.lastName, updateButtonState: vm.updateButtonState)
                SignupSecureField(systemName: "lock", placeholder: "Password", value: $vm.password, updateButtonState: vm.updateButtonState)
                SignupSecureField(systemName: "lock.fill", placeholder: "Confirm password", value: $vm.confirmPassword, updateButtonState: vm.updateButtonState)
                SignupButton(handleSignupButton: vm.signup, isButtonDisabled: vm.isButtonDisabled)
                Spacer()
            }.alert(vm.errorMessage, isPresented: $vm.showAlert, actions: {
                
            })
            .navigationTitle("Signup")
            .padding(15)
        }
    }
}

#Preview {
    SignupView()
}
