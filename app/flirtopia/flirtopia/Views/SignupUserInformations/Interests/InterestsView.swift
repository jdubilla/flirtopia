//
//  InterestsView.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI
import WrappingHStack

struct InterestsView: View {
    
    @StateObject var vm = InterestsViewModel()
    
    var body: some View {
        VStack {
            Text("Your interests")
                .font(.largeTitle)
            WrappingHStack(vm.tags, id: \.self) {
                TagTile(tag: $0, vm: vm)
            }
            Button(action: {
                Task {
                    try await vm.createInterests()
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
                    .opacity(vm.selectedTags.isEmpty ? 0.7 : 1)
            }).disabled(vm.selectedTags.isEmpty)
        }
        .padding(15)
        .navigationBarBackButtonHidden(true)
        .alert(vm.errorMessage, isPresented: $vm.showAlert, actions: {})
        .navigationDestination(isPresented: $vm.navigate) {
            DescriptionView()
        }
    }
}

#Preview {
    InterestsView()
}
