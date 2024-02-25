//
//  PreferenceView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct PreferenceView: View {
    
    @StateObject var vm = PreferenceViewModel()
    
    var body: some View {
        VStack {
            Text("Select your preference")
                .font(.largeTitle)
            Picker("Gender", selection: $vm.selectedPreference) {
                ForEach(vm.choices, id: \.self) {
                    Text($0)
                }
            }.pickerStyle(.wheel)
            Button(action: {
                Task {
                    try await vm.createPreference()
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
            InterestsView()
        }
    }
}

#Preview {
    PreferenceView()
}
