//
//  DescriptionView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct DescriptionView: View {
    
    @StateObject var vm = DescriptionViewModel()
    
    var body: some View {
        VStack {
            Text("Describe yourself")
                .font(.largeTitle)
            Form {
                Section("Enter a brief description of yourself") {
                    TextEditor(text: $vm.description)
                        .frame(height: 150)
                }
            }
            .frame(height: 250)
            .clipShape(RoundedRectangle(cornerRadius: 15))
            Button(action: {
                Task {
                    try await vm.createPreference()
                    try await vm.setAllInfosSet()
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
                    .opacity(vm.description.isEmpty ? 0.7 : 1)
            }).disabled(vm.description.isEmpty)
        }
        .padding(15)
        .navigationBarBackButtonHidden(true)
        .alert(vm.errorMessage, isPresented: $vm.showAlert, actions: {})
        .navigationDestination(isPresented: $vm.navigate) {
            MainTabView()
        }
    }
}

#Preview {
    DescriptionView()
}
