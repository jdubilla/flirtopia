//
//  SignupSecureField.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct SignupSecureField: View {
    
    let systemName: String
    let placeholder: String
    @Binding var value: String
    var updateButtonState: () -> Void
    
    var body: some View {
        HStack {
            Image(systemName: systemName)
                .resizable()
                .frame(width: 25, height: 25)
                .foregroundStyle(.gray)
            VStack {
                SecureField(placeholder, text: $value)
                    .font(.title2)
                    .textInputAutocapitalization(.never)
                    .onChange(of: value) { _, _ in
                        updateButtonState()
                    }
                Rectangle()
                    .frame(height: 1)
                    .padding(.trailing, 20)
                    .foregroundStyle(.gray)
            }
        }.padding(.top, 25)
    }
}
