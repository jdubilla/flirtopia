//
//  TagTile.swift
//  flirtopia
//
//  Created by Jean-baptiste DUBILLARD on 24/02/2024.
//

import SwiftUI

struct TagTile: View {
    
    let tagName: String
    @StateObject var vm: InterestsViewModel
    
    var body: some View {
        Text(tagName)
            .padding(10)
            .background(vm.selectedTags.contains(tagName) ? Color(hex: 0xCF0CB5) : Color(hex: 0xFEEB0B))
            .foregroundColor(vm.selectedTags.contains(tagName) ? .white : .black)
            .font(.system(size: 23))
            .clipShape(RoundedRectangle(cornerRadius: 15))
            .onTapGesture {
                if vm.selectedTags.contains(tagName) {
                    vm.selectedTags.removeAll {$0 == tagName}
                } else if vm.selectedTags.count < 5 {
                    vm.selectedTags.append(tagName)
                }
            }
    }
}

//#Preview {
//    TagTile(tagName: "Travel")
//}
