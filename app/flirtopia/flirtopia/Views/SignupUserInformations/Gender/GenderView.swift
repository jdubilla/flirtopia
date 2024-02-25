//
//  GenderView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import SwiftUI

struct GenderView: View {
    
    @StateObject var vm = GenderViewModel()
    
    var body: some View {
        VStack {
            Text("Select your gender")
                .font(.largeTitle)
            Picker("Gender", selection: $vm.selectedGender) {
                ForEach(vm.choices, id: \.self) {
                    Text($0)
                }
            }.pickerStyle(.wheel)
            Button(action: {
                Task {
                    try await vm.createGender()
                }
            }, label: {
                Text("Next")
                    .padding(EdgeInsets(top: 15, leading: 50, bottom: 15, trailing: 50))
                    .frame(maxWidth: 250)
                    .background(
                        LinearGradient(gradient: Gradient(colors: [Color(hex: 0xCF0CB5), Color(hex: 0xFD5E64), Color(hex: 0xFEEB0B)]), startPoint: .leading, endPoint: .trailing)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                    .foregroundStyle(.white)
                    .fontWeight(.bold)
                    .font(.system(size: 24))
                    .padding(.top, 40)
            })
        }
        .navigationBarBackButtonHidden(true)
        .alert(vm.errorMessage, isPresented: $vm.showAlert, actions: {})
        .navigationDestination(isPresented: $vm.navigate) {
            PreferenceView()
        }
    }
}

#Preview {
    GenderView()
}
