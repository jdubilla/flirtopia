//
//  ButtonLogin.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import SwiftUI

struct LoginButton: View {
    
    @StateObject var vm: LoginViewModel
    
    var body: some View {
        Button(action: {
            Task {
                try await vm.signin()
            }
        }, label: {
            Text("Login")
                .padding(EdgeInsets(top: 15, leading: 50, bottom: 15, trailing: 50))
                .frame(maxWidth: 250)
                .background(
                    LinearGradient(gradient: Gradient(colors: [Color(hex: 0xCF0CB5), Color(hex: 0xFD5E64), Color(hex: 0xFEEB0B)]), startPoint: .leading, endPoint: .trailing)
                )
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .foregroundStyle(.white)
                .fontWeight(.bold)
                .font(.system(size: 24))
                .opacity(vm.username.isEmpty || vm.password.isEmpty || vm.isButtonDisabled ? 0.7 : 1)
        })
        .disabled(vm.username.isEmpty || vm.password.isEmpty || vm.isButtonDisabled)
        .padding(.top, 75)
        .navigationDestination(isPresented: $vm.navigate) {
//            BirthView()
            InterestsView()
        }
    }
}

//#Preview {
//    LoginButton()
//}
