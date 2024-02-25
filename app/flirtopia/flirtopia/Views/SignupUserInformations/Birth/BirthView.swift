//
//  BirthView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 23/02/2024.
//

import SwiftUI

struct BirthView: View {
    
    @ObservedObject private var vm = BirthViewModel()
    
    var body: some View {
        VStack {
            Text("Enter your date of birth")
                .font(.largeTitle)
            
            DatePicker("", selection: $vm.date, displayedComponents: .date)
                .labelsHidden()
                .datePickerStyle(WheelDatePickerStyle())
                .frame(minWidth: 0, maxWidth: .infinity, alignment: .center)
            
            if vm.isUnderAge {
                Text("You must be 18 or older to continue.")
                    .foregroundColor(.red)
            }
            
            Button(action: {
                Task {
                    try await vm.createBirthDate()
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
                    .opacity(vm.isUnderAge ? 0.7 : 1)
            }).disabled(vm.isUnderAge || vm.isButtonDisabled)
        }
        .navigationBarBackButtonHidden(true)
        .alert(vm.errorMessage, isPresented: $vm.showAlert, actions: {})
        .onChange(of: vm.date) { oldValue, newValue in
            vm.isUnderAgeCheck()
        }
        .navigationDestination(isPresented: $vm.navigate) {
            GenderView()
        }
    }
}

#Preview {
    BirthView()
}
